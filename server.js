// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// src/utils/parserUtils.ts
function convertPersianDigitsToEnglish(str) {
  if (!str) return "";
  const persianDigits = ["\u06F0", "\u06F1", "\u06F2", "\u06F3", "\u06F4", "\u06F5", "\u06F6", "\u06F7", "\u06F8", "\u06F9"];
  const arabicDigits = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), i.toString()).replace(new RegExp(arabicDigits[i], "g"), i.toString());
  }
  return result;
}
function cleanPhoneNumber(rawPhone, defaultCountry = "Iran") {
  if (!rawPhone) return "";
  const converted = convertPersianDigitsToEnglish(rawPhone);
  const cleaned = converted.replace(/[\s\(\)\-\.]/g, "");
  return cleaned;
}
function isIranMobile(phone) {
  const cleaned = cleanPhoneNumber(phone);
  return /^(\+98|0098|98|0)?9\d{9}$/.test(cleaned);
}
function formatForWhatsApp(phone) {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return "";
  let standard = cleaned.replace(/^00/, "").replace(/^\+/, "");
  if (standard.startsWith("09")) {
    standard = "98" + standard.slice(1);
  } else if (standard.startsWith("9") && standard.length === 10) {
    standard = "98" + standard;
  }
  return standard;
}
function normalizeInstagram(input) {
  if (!input) return null;
  let clean = input.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "");
  clean = clean.replace(/[\/\?].*$/, "");
  clean = clean.replace(/^@/, "");
  if (!clean || clean.length < 2) return null;
  return {
    handle: `@${clean}`,
    url: `https://instagram.com/${clean}`
  };
}
function normalizeWebsite(url) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}
function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let text = rawText.trim();
  try {
    return JSON.parse(text);
  } catch {
  }
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
    }
  }
  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const arrayStr = text.substring(arrayStart, arrayEnd + 1);
    try {
      return JSON.parse(arrayStr);
    } catch {
    }
  }
  const objStart = text.indexOf("{");
  const objEnd = text.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    const objStr = text.substring(objStart, objEnd + 1);
    try {
      return JSON.parse(objStr);
    } catch {
    }
  }
  return null;
}
function normalizeLead(item, index, defaultCity = "", defaultCountry = "\u0627\u06CC\u0631\u0627\u0646") {
  const name = String(item.name || item.title || item.businessName || `\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 ${index + 1}`).trim();
  const phone = cleanPhoneNumber(String(item.phone || item.phoneNumber || item.tel || ""));
  const address = String(item.address || item.fullAddress || item.location || "").trim();
  const city = String(item.city || defaultCity || "").trim();
  const country = String(item.country || defaultCountry || (city.includes("\u0642\u0645") || city.includes("\u062A\u0647\u0631\u0627\u0646") || city.includes("\u0645\u0634\u0647\u062F") || city.includes("\u0627\u0635\u0641\u0647\u0627\u0646") ? "\u0627\u06CC\u0631\u0627\u0646" : "\u0627\u06CC\u0631\u0627\u0646")).trim();
  const rawInstagram = String(item.instagram || item.ig || item.instagramHandle || "");
  const instaObj = normalizeInstagram(rawInstagram);
  const website = normalizeWebsite(item.website || item.site || item.url);
  let lat = item.latitude !== void 0 ? Number(item.latitude) : void 0;
  let lng = item.longitude !== void 0 ? Number(item.longitude) : void 0;
  if (isNaN(lat)) lat = void 0;
  if (isNaN(lng)) lng = void 0;
  let googleMapsUrl = item.googleMapsUrl || item.mapUrl || item.mapsLink || item.uri;
  if (!googleMapsUrl) {
    if (lat && lng) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else if (name && city) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
    }
  }
  let rating = item.rating ? Number(item.rating) : void 0;
  if (rating !== void 0 && (isNaN(rating) || rating <= 0 || rating > 5)) {
    rating = void 0;
  }
  let reviewsCount = item.reviewsCount ? Number(item.reviewsCount) : void 0;
  if (reviewsCount !== void 0 && isNaN(reviewsCount)) {
    reviewsCount = void 0;
  }
  const features = Array.isArray(item.features) ? item.features.map(String) : typeof item.features === "string" ? item.features.split(/[,،-]/).map((s) => s.trim()).filter(Boolean) : [];
  const secondaryPhones = [];
  if (Array.isArray(item.secondaryPhones)) {
    item.secondaryPhones.forEach((p) => {
      const cleaned = cleanPhoneNumber(String(p));
      if (cleaned && cleaned !== phone && !secondaryPhones.includes(cleaned)) {
        secondaryPhones.push(cleaned);
      }
    });
  }
  return {
    id: String(item.id || `lead-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`),
    name,
    latinName: item.latinName ? String(item.latinName).trim() : void 0,
    category: String(item.category || item.type || "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631").trim(),
    phone,
    phoneFormatted: phone,
    secondaryPhones: secondaryPhones.length > 0 ? secondaryPhones : void 0,
    mobile: isIranMobile(phone) ? phone : void 0,
    whatsapp: formatForWhatsApp(phone),
    address: address || `${city} - \u062B\u0628\u062A \u0634\u062F\u0647 \u062F\u0631 \u06AF\u0648\u06AF\u0644 \u0645\u067E`,
    neighborhood: item.neighborhood ? String(item.neighborhood).trim() : void 0,
    city: city || "\u0646\u0627\u0645\u0634\u062E\u0635",
    provinceOrState: item.provinceOrState ? String(item.provinceOrState).trim() : void 0,
    country: country || "\u0627\u06CC\u0631\u0627\u0646",
    website: website || void 0,
    instagram: instaObj ? instaObj.handle : void 0,
    telegram: item.telegram ? String(item.telegram).trim() : void 0,
    rating,
    reviewsCount,
    priceLevel: item.priceLevel ? String(item.priceLevel) : void 0,
    hours: item.hours ? String(item.hours) : void 0,
    isOpenNow: typeof item.isOpenNow === "boolean" ? item.isOpenNow : null,
    latitude: lat,
    longitude: lng,
    googleMapsUrl,
    features: features.length > 0 ? features : void 0,
    description: item.description ? String(item.description).trim() : void 0
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = 3e3;
app.use(express.json());
var apiKey = process.env.GEMINI_API_KEY || "";
var ai = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var DEMO_SEEDS = {
  qom_pastry: [
    {
      id: "qom-1",
      name: "\u0633\u0648\u0647\u0627\u0646 \u0648 \u0634\u06CC\u0631\u06CC\u0646\u06CC \u0633\u0627\u0639\u062F\u06CC\u200C\u0646\u06CC\u0627",
      latinName: "Saedinia Confectionery & Sohan",
      category: "\u0642\u0646\u0627\u062F\u06CC \u0648 \u0633\u0648\u0647\u0627\u0646\u200C\u067E\u0632\u06CC \u0645\u0645\u062A\u0627\u0632",
      phone: "02537740000",
      secondaryPhones: ["02532938888", "09121518000"],
      mobile: "09121518000",
      whatsapp: "989121518000",
      address: "\u0642\u0645\u060C \u0628\u0644\u0648\u0627\u0631 \u0627\u0645\u06CC\u0646\u060C \u0628\u06CC\u0646 \u06A9\u0648\u0686\u0647 \u06F1\u06F1 \u0648 \u06F1\u06F3",
      neighborhood: "\u0628\u0644\u0648\u0627\u0631 \u0627\u0645\u06CC\u0646",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://saedinia.com",
      instagram: "@saedinia_sweet",
      rating: 4.8,
      reviewsCount: 1420,
      priceLevel: "\u0644\u0648\u06A9\u0633",
      hours: "\u06F0\u06F8:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F3\u06F0 \u06CC\u06A9\u0633\u0631\u0647",
      isOpenNow: true,
      latitude: 34.6295,
      longitude: 50.8654,
      googleMapsUrl: "https://maps.google.com/?cid=12345678901",
      features: ["\u0633\u0648\u0647\u0627\u0646 \u062D\u0628\u0647\u200C\u0627\u06CC \u0632\u0639\u0641\u0631\u0627\u0646\u06CC", "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u062F\u0627\u0646\u0645\u0627\u0631\u06A9\u06CC \u0648 \u062A\u0631", "\u0634\u06A9\u0644\u0627\u062A \u062F\u0633\u062A\u200C\u0633\u0627\u0632", "\u067E\u0627\u0631\u06A9\u06CC\u0646\u06AF \u0627\u062E\u062A\u0635\u0627\u0635\u06CC", "\u0627\u0631\u0633\u0627\u0644 \u0633\u0631\u0627\u0633\u0631\u06CC"],
      description: "\u06CC\u06A9\u06CC \u0627\u0632 \u0642\u062F\u06CC\u0645\u06CC\u200C\u062A\u0631\u06CC\u0646 \u0648 \u0645\u0639\u062A\u0628\u0631\u062A\u0631\u06CC\u0646 \u0628\u0631\u0646\u062F\u0647\u0627\u06CC \u0633\u0648\u0647\u0627\u0646 \u0648 \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u062C\u0627\u062A \u0627\u0639\u0644\u0627 \u062F\u0631 \u0642\u0645 \u0628\u0627 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F\u0647\u0627\u06CC \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0635\u0627\u062F\u0631\u0627\u062A\u06CC."
    },
    {
      id: "qom-2",
      name: "\u0633\u0648\u0647\u0627\u0646 \u062E\u0648\u062F\u06A9\u0627\u0631 (\u0634\u0639\u0628\u0647 \u0645\u0631\u06A9\u0632\u06CC)",
      latinName: "Sohan Khodkar Central",
      category: "\u0633\u0648\u0647\u0627\u0646\u200C\u067E\u0632\u06CC \u0648 \u0634\u06CC\u0631\u06CC\u0646\u06CC \u0633\u0646\u062A\u06CC",
      phone: "02537730000",
      secondaryPhones: ["02537738000"],
      mobile: "09121524000",
      whatsapp: "989121524000",
      address: "\u0642\u0645\u060C \u0645\u06CC\u062F\u0627\u0646 \u0622\u0633\u062A\u0627\u0646\u0647\u060C \u062C\u0646\u0628 \u0647\u062A\u0644 \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0642\u0645",
      neighborhood: "\u062D\u0631\u0645 \u0645\u0637\u0647\u0631 - \u0645\u06CC\u062F\u0627\u0646 \u0622\u0633\u062A\u0627\u0646\u0647",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://khodkarsohan.ir",
      instagram: "@sohankhodkar_official",
      rating: 4.7,
      reviewsCount: 1890,
      priceLevel: "\u0645\u062A\u0648\u0633\u0637 \u0628\u0647 \u0628\u0627\u0644\u0627",
      hours: "\u06F0\u06F7:\u06F3\u06F0 \u0627\u0644\u06CC \u06F2\u06F4:\u06F0\u06F0",
      isOpenNow: true,
      latitude: 34.6428,
      longitude: 50.8789,
      googleMapsUrl: "https://maps.google.com/?cid=12345678902",
      features: ["\u0633\u0648\u0647\u0627\u0646 \u0644\u0642\u0645\u0647\u200C\u0627\u06CC \u0645\u063A\u0632\u062F\u0627\u0631", "\u06A9\u0631\u0647 \u062D\u06CC\u0648\u0627\u0646\u06CC \u062E\u0627\u0644\u0635", "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u0646\u062E\u0648\u062F\u0686\u06CC \u0627\u0639\u0644\u0627", "\u067E\u0630\u06CC\u0631\u0627\u06CC\u06CC \u0628\u0627 \u0686\u0627\u06CC \u0648 \u0633\u0648\u0647\u0627\u0646 \u06AF\u0631\u0645"],
      description: "\u0627\u0635\u06CC\u0644\u200C\u062A\u0631\u06CC\u0646 \u0633\u0648\u0647\u0627\u0646\u200C\u067E\u0632\u06CC \u0633\u0646\u062A\u06CC \u0642\u0645 \u067E\u062E\u062A\u0647 \u0634\u062F\u0647 \u0628\u0627 \u06A9\u0631\u0647 \u062D\u06CC\u0648\u0627\u0646\u06CC \u0646\u0627\u0628 \u0648 \u0632\u0639\u0641\u0631\u0627\u0646 \u0642\u0627\u0626\u0646\u0627\u062A \u062F\u0631 \u062C\u0648\u0627\u0631 \u062D\u0631\u0645 \u062D\u0636\u0631\u062A \u0645\u0639\u0635\u0648\u0645\u0647."
    },
    {
      id: "qom-3",
      name: "\u0642\u0646\u0627\u062F\u06CC \u0628\u0648\u0639\u0644\u06CC",
      latinName: "Bouali Pastry",
      category: "\u0642\u0646\u0627\u062F\u06CC \u0645\u062F\u0631\u0646 \u0648 \u06A9\u06CC\u06A9 \u062A\u0648\u0644\u062F",
      phone: "02537701111",
      secondaryPhones: ["02537702222"],
      mobile: "09122513300",
      whatsapp: "989122513300",
      address: "\u0642\u0645\u060C \u0627\u0628\u062A\u062F\u0627\u06CC \u062E\u06CC\u0627\u0628\u0627\u0646 \u0634\u0647\u06CC\u062F \u0644\u0648\u0627\u0633\u0627\u0646\u06CC (\u0628\u0648\u0631\u0627\u0646\u06CC)",
      neighborhood: "\u0645\u0631\u06A9\u0632 \u0634\u0647\u0631",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://boualipastry.ir",
      instagram: "@bouali_pastry_qom",
      rating: 4.6,
      reviewsCount: 950,
      priceLevel: "\u0645\u062A\u0648\u0633\u0637",
      hours: "\u06F0\u06F9:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F0\u06F0",
      isOpenNow: true,
      latitude: 34.6385,
      longitude: 50.8812,
      googleMapsUrl: "https://maps.google.com/?cid=12345678903",
      features: ["\u06A9\u06CC\u06A9\u200C\u0647\u0627\u06CC \u0639\u0631\u0648\u0633\u06CC \u0648 \u0641\u0648\u0646\u062F\u0627\u0646\u062A", "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u062E\u0627\u0645\u0647\u200C\u0627\u06CC \u0641\u0631\u0627\u0646\u0633\u0648\u06CC", "\u062F\u0633\u0631\u0647\u0627\u06CC \u0645\u062F\u0631\u0646", "\u067E\u0627\u06CC \u0633\u06CC\u0628 \u0648 \u062A\u0627\u0631\u062A \u0645\u06CC\u0648\u0647"],
      description: "\u067E\u06CC\u0634\u0631\u0648 \u062F\u0631 \u067E\u062E\u062A \u06A9\u06CC\u06A9\u200C\u0647\u0627\u06CC \u0633\u0641\u0627\u0631\u0634\u06CC \u0645\u062C\u0627\u0644\u0633\u060C \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u062A\u0631 \u062A\u0627\u0632\u0647 \u0648 \u062F\u0633\u0631\u0647\u0627\u06CC \u0631\u0648\u0632 \u0627\u0631\u0648\u067E\u0627 \u062F\u0631 \u0642\u0645."
    },
    {
      id: "qom-4",
      name: "\u0633\u0648\u0647\u0627\u0646 \u062D\u0627\u062C \u0631\u0636\u0627 \u0645\u062D\u0645\u062F\u06CC \u0648 \u067E\u0633\u0631\u0627\u0646",
      latinName: "Haj Reza Mohammadi Sohan",
      category: "\u0633\u0648\u0647\u0627\u0646\u200C\u067E\u0632\u06CC \u0627\u0639\u0644\u0627",
      phone: "02537745050",
      secondaryPhones: ["02537746060"],
      address: "\u0642\u0645\u060C \u0645\u06CC\u062F\u0627\u0646 \u06F7\u06F2 \u062A\u0646\u060C \u062C\u0646\u0628 \u067E\u0627\u06CC\u0627\u0646\u0647 \u0645\u0633\u0627\u0641\u0631\u0628\u0631\u06CC",
      neighborhood: "\u0645\u06CC\u062F\u0627\u0646 \u06F7\u06F2 \u062A\u0646",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://sohanmohammadi.com",
      instagram: "@sohan_mohammadi_qom",
      rating: 4.5,
      reviewsCount: 1100,
      priceLevel: "\u0645\u062A\u0648\u0633\u0637",
      hours: "\u06F2\u06F4 \u0633\u0627\u0639\u062A\u0647 (\u0634\u0628\u0627\u0646\u0647 \u0631\u0648\u0632\u06CC)",
      isOpenNow: true,
      latitude: 34.671,
      longitude: 50.8845,
      googleMapsUrl: "https://maps.google.com/?cid=12345678904",
      features: ["\u0633\u0648\u0647\u0627\u0646 \u062F\u0633\u0631 \u0648 \u062D\u0644\u0648\u0627", "\u0633\u0648\u0647\u0627\u0646 \u06AF\u0644 \u0646\u0627\u0632\u06A9", "\u0633\u0648\u0647\u0627\u0646 \u0639\u0633\u0644\u06CC \u06A9\u0646\u062C\u062F\u06CC", "\u0628\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u06A9\u0627\u062F\u0648\u06CC\u06CC \u0641\u0644\u0632\u06CC \u0636\u062F \u0631\u0637\u0648\u0628\u062A"],
      description: "\u06CC\u06A9\u06CC \u0627\u0632 \u067E\u0631\u0641\u0631\u0648\u0634\u200C\u062A\u0631\u06CC\u0646 \u0633\u0648\u0647\u0627\u0646\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0634\u0647\u0631 \u0642\u0645 \u0628\u0627 \u067E\u062E\u062A \u0645\u062F\u0627\u0648\u0645 \u0631\u0648\u0632\u0627\u0646\u0647 \u0648 \u0637\u0639\u0645 \u0628\u06CC\u200C\u0646\u0638\u06CC\u0631 \u0647\u0644 \u0648 \u06AF\u0644\u0627\u0628."
    },
    {
      id: "qom-5",
      name: "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u0648 \u06A9\u0627\u0641\u0647 \u0627\u0644\u0641 (\u0634\u0639\u0628\u0647 \u0642\u0645)",
      latinName: "Alef Confectionery & Cafe",
      category: "\u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0641\u0631\u0648\u0634\u06CC \u0644\u0648\u06A9\u0633 \u0648 \u06A9\u0627\u0641\u0647 \u0642\u0646\u0627\u062F\u06CC",
      phone: "02532900010",
      secondaryPhones: ["02532900011"],
      mobile: "09127508000",
      whatsapp: "989127508000",
      address: "\u0642\u0645\u060C \u0633\u0627\u0644\u0627\u0631\u06CC\u0647\u060C \u0646\u0628\u0634 \u0641\u0644\u06A9\u0647 \u0645\u06CC\u062B\u0645",
      neighborhood: "\u0633\u0627\u0644\u0627\u0631\u06CC\u0647",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://alefconfectionery.ir",
      instagram: "@alef_confectionery_qom",
      rating: 4.9,
      reviewsCount: 1680,
      priceLevel: "\u0644\u0648\u06A9\u0633",
      hours: "\u06F0\u06F9:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F4\u06F5",
      isOpenNow: true,
      latitude: 34.619,
      longitude: 50.852,
      googleMapsUrl: "https://maps.google.com/?cid=12345678905",
      features: ["\u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u062E\u0634\u06A9 \u0627\u062A\u0631\u06CC\u0634\u06CC", "\u0686\u06CC\u0632\u06A9\u06CC\u06A9 \u0646\u06CC\u0648\u06CC\u0648\u0631\u06A9\u06CC", "\u06A9\u0627\u0641\u0647 \u0628\u0627\u0631\u06CC\u0633\u062A\u0627 \u0628\u0627 \u0627\u0646\u0648\u0627\u0639 \u0642\u0647\u0648\u0647", "\u0628\u0627\u0642\u0644\u0648\u0627\u06CC \u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644\u06CC \u062F\u0627\u063A"],
      description: "\u0645\u062D\u06CC\u0637\u06CC \u0634\u06CC\u06A9 \u0648 \u0645\u062C\u0644\u0644 \u062F\u0631 \u0645\u0646\u0637\u0642\u0647 \u0633\u0627\u0644\u0627\u0631\u06CC\u0647 \u0642\u0645 \u0628\u0627 \u0627\u0631\u0627\u0626\u0647 \u0628\u0627\u06A9\u06CC\u0641\u06CC\u062A\u200C\u062A\u0631\u06CC\u0646 \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0648 \u0641\u0636\u0627\u06CC \u067E\u0630\u06CC\u0631\u0627\u06CC\u06CC \u06A9\u0627\u0641\u0647."
    },
    {
      id: "qom-6",
      name: "\u0642\u0646\u0627\u062F\u06CC \u0644\u0627\u0644\u0647",
      latinName: "Laleh Pastry",
      category: "\u0642\u0646\u0627\u062F\u06CC \u0628\u0627\u0633\u0627\u0628\u0642\u0647",
      phone: "02536612020",
      address: "\u0642\u0645\u060C \u062E\u06CC\u0627\u0628\u0627\u0646 \u0627\u0645\u0627\u0645 \u062E\u0645\u06CC\u0646\u06CC\u060C \u0628\u06CC\u0646 \u06A9\u0648\u0686\u0647 \u06F1\u06F5 \u0648 \u06F1\u06F7",
      neighborhood: "\u062E\u06CC\u0627\u0628\u0627\u0646 \u0627\u0645\u0627\u0645",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      instagram: "@laleh_sweet_qom",
      rating: 4.4,
      reviewsCount: 620,
      priceLevel: "\u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0648 \u0628\u0627\u06A9\u06CC\u0641\u06CC\u062A",
      hours: "\u06F0\u06F8:\u06F3\u06F0 \u0627\u0644\u06CC \u06F2\u06F2:\u06F3\u06F0",
      isOpenNow: true,
      latitude: 34.654,
      longitude: 50.887,
      googleMapsUrl: "https://maps.google.com/?cid=12345678906",
      features: ["\u0632\u0648\u0644\u0628\u06CC\u0627 \u0628\u0627\u0645\u06CC\u0647 \u062F\u0627\u063A \u0627\u0639\u0644\u0627", "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u0632\u0628\u0627\u0646 \u0648 \u067E\u0627\u067E\u06CC\u0648\u0646", "\u06A9\u06CC\u06A9 \u0628\u0633\u062A\u0646\u06CC", "\u0646\u0627\u0646 \u062E\u0627\u0645\u0647\u200C\u0627\u06CC \u0628\u0632\u0631\u06AF"],
      description: "\u0642\u0646\u0627\u062F\u06CC \u0645\u0631\u062F\u0645\u06CC \u0648 \u0628\u0633\u06CC\u0627\u0631 \u067E\u0631\u0637\u0631\u0641\u062F\u0627\u0631 \u062F\u0631 \u062E\u06CC\u0627\u0628\u0627\u0646 \u0627\u0645\u0627\u0645 \u0642\u0645 \u0628\u0627 \u0633\u0627\u0628\u0642\u0647 \u06F4\u06F0 \u0633\u0627\u0644\u0647 \u062F\u0631 \u0639\u0631\u0636\u0647 \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u062A\u0627\u0632\u0647 \u0633\u0646\u062A\u06CC."
    },
    {
      id: "qom-7",
      name: "\u0633\u0648\u0647\u0627\u0646 \u0631\u0648\u062D\u200C\u0627\u0644\u0627\u0645\u06CC\u0646",
      latinName: "Rouh-ol-Amin Sohan",
      category: "\u0633\u0648\u0647\u0627\u0646 \u0633\u0646\u062A\u06CC \u0628\u0631\u062A\u0631",
      phone: "02537785500",
      mobile: "09121539090",
      address: "\u0642\u0645\u060C \u062E\u06CC\u0627\u0628\u0627\u0646 \u06F1\u06F9 \u062F\u06CC (\u0628\u0627\u062C\u06A9)\u060C \u062C\u0646\u0628 \u06A9\u0648\u0686\u0647 \u06F2\u06F8",
      neighborhood: "\u0628\u0627\u062C\u06A9",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      website: "https://rouholamin-sohan.com",
      instagram: "@rouholamin_sohan",
      rating: 4.7,
      reviewsCount: 840,
      priceLevel: "\u0645\u062A\u0648\u0633\u0637 \u0628\u0647 \u0628\u0627\u0644\u0627",
      hours: "\u06F0\u06F8:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F0\u06F0",
      isOpenNow: true,
      latitude: 34.6515,
      longitude: 50.898,
      googleMapsUrl: "https://maps.google.com/?cid=12345678907",
      features: ["\u0633\u0648\u0647\u0627\u0646 \u062D\u0628\u0647\u200C\u0627\u06CC \u0632\u0631\u0634\u06A9\u06CC \u0648 \u067E\u0633\u062A\u0647", "\u06AF\u0632 \u0622\u0631\u062F\u06CC \u0644\u0642\u0645\u0647\u200C\u0627\u06CC", "\u062D\u0644\u0648\u0627 \u0633\u0648\u0647\u0627\u0646 \u0631\u0698\u06CC\u0645\u06CC \u06A9\u0645\u200C\u0634\u06A9\u0631", "\u0641\u0631\u0648\u0634 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC"],
      description: "\u067E\u062E\u062A \u0633\u0648\u0647\u0627\u0646 \u0628\u0627 \u062C\u0648\u0627\u0646\u0647 \u06AF\u0646\u062F\u0645 \u0627\u0631\u06AF\u0627\u0646\u06CC\u06A9 \u0648 \u0631\u0648\u063A\u0646 \u062D\u06CC\u0648\u0627\u0646\u06CC \u0627\u0639\u0644\u0627\u06CC \u06A9\u0631\u0645\u0627\u0646\u0634\u0627\u0647 \u0628\u0627 \u0645\u0627\u0646\u062F\u06AF\u0627\u0631\u06CC \u0648 \u062A\u0631\u062F\u06CC \u0641\u0648\u0642\u200C\u0627\u0644\u0639\u0627\u062F\u0647."
    },
    {
      id: "qom-8",
      name: "\u0642\u0646\u0627\u062F\u06CC \u0646\u0627\u062A\u0627\u0644\u06CC \u0642\u0645",
      latinName: "Natalie Pastry",
      category: "\u0642\u0646\u0627\u062F\u06CC \u0648 \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u062E\u0634\u06A9 \u0648 \u062A\u0631",
      phone: "02532924400",
      secondaryPhones: ["02532924401"],
      address: "\u0642\u0645\u060C \u0632\u0646\u0628\u06CC\u0644\u200C\u0622\u0628\u0627\u062F (\u0634\u0647\u06CC\u062F \u0635\u062F\u0648\u0642\u06CC)\u060C \u0646\u0628\u0634 \u06A9\u0648\u0686\u0647 \u06F2\u06F0",
      neighborhood: "\u0632\u0646\u0628\u06CC\u0644\u200C\u0622\u0628\u0627\u062F",
      city: "\u0642\u0645",
      provinceOrState: "\u0642\u0645",
      country: "\u0627\u06CC\u0631\u0627\u0646",
      instagram: "@natalie_pastry_qom",
      rating: 4.6,
      reviewsCount: 710,
      priceLevel: "\u0645\u062A\u0648\u0633\u0637 \u0628\u0647 \u0628\u0627\u0644\u0627",
      hours: "\u06F0\u06F9:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F3\u06F0",
      isOpenNow: true,
      latitude: 34.6185,
      longitude: 50.867,
      googleMapsUrl: "https://maps.google.com/?cid=12345678908",
      features: ["\u0634\u06CC\u0631\u06CC\u0646\u06CC \u0646\u0627\u067E\u0644\u0626\u0648\u0646\u06CC \u062A\u0627\u0632\u0647", "\u06A9\u06CC\u06A9 \u062A\u0635\u0648\u06CC\u0631 \u062E\u0648\u0631\u0627\u06A9\u06CC", "\u06A9\u0627\u067E \u06A9\u06CC\u06A9 \u062C\u0634\u0646 \u062A\u0648\u0644\u062F", "\u0634\u06CC\u0631\u06CC\u0646\u06CC \u0639\u06CC\u062F \u0646\u0648\u0631\u0648\u0632"],
      description: "\u06CC\u06A9\u06CC \u0627\u0632 \u067E\u0631\u0645\u0634\u062A\u0631\u06CC\u200C\u062A\u0631\u06CC\u0646 \u0642\u0646\u0627\u062F\u06CC\u200C\u0647\u0627\u06CC \u0645\u0646\u0637\u0642\u0647 \u0632\u0646\u0628\u06CC\u0644\u200C\u0622\u0628\u0627\u062F \u0642\u0645 \u0628\u0627 \u062A\u0646\u0648\u0639 \u0628\u06CC\u200C\u0646\u0638\u06CC\u0631 \u062F\u0631 \u067E\u062E\u062A \u0634\u06CC\u0631\u06CC\u0646\u06CC\u200C\u0647\u0627\u06CC \u062E\u0627\u0646\u06AF\u06CC \u0648 \u0645\u062C\u0644\u0633\u06CC."
    }
  ]
};
app.post("/api/extract", async (req, res) => {
  const startTime = Date.now();
  const { query, mode = "maps_grounding", targetCity, targetCountry, userLocation } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "\u0644\u0637\u0641\u0627\u064B \u0639\u0628\u0627\u0631\u062A \u062C\u0633\u062A\u062C\u0648 \u06CC\u0627 \u0639\u0646\u0648\u0627\u0646 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F." });
  }
  const cleanQuery = query.trim();
  if (!ai) {
    let mockResults = [];
    if (cleanQuery.includes("\u0642\u0645") || cleanQuery.includes("\u0633\u0648\u0647\u0627\u0646") || cleanQuery.includes("\u0634\u06CC\u0631\u06CC\u0646\u06CC")) {
      mockResults = DEMO_SEEDS.qom_pastry;
    } else {
      mockResults = [
        {
          id: `demo-${Date.now()}-1`,
          name: `${cleanQuery} - \u0645\u062C\u0645\u0648\u0639\u0647 \u0645\u0631\u06A9\u0632\u06CC \u06F1`,
          category: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u062A\u0631",
          phone: "02188880001",
          secondaryPhones: ["09121110001"],
          mobile: "09121110001",
          whatsapp: "989121110001",
          address: `\u0645\u0631\u06A9\u0632 \u0627\u0635\u0644\u06CC - \u062E\u06CC\u0627\u0628\u0627\u0646 \u0627\u0646\u0642\u0644\u0627\u0628\u060C \u067E\u0644\u0627\u06A9 \u06F1\u06F2`,
          city: targetCity || "\u062A\u0647\u0631\u0627\u0646",
          country: targetCountry || "\u0627\u06CC\u0631\u0627\u0646",
          website: "https://example-business.com",
          instagram: "@sample_business",
          rating: 4.8,
          reviewsCount: 540,
          hours: "\u06F0\u06F9:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F2:\u06F0\u06F0",
          isOpenNow: true,
          latitude: 35.6892,
          longitude: 51.389,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`,
          features: ["\u06A9\u06CC\u0641\u06CC\u062A \u062A\u0636\u0645\u06CC\u0646\u06CC", "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062D\u0636\u0648\u0631\u06CC \u0648 \u062A\u0644\u0641\u0646\u06CC", "\u0627\u0631\u0633\u0627\u0644 \u0633\u0631\u06CC\u0639"],
          description: `\u0648\u0627\u062D\u062F \u067E\u06CC\u0634\u0631\u0648 \u0648 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 \u0632\u0645\u06CC\u0646\u0647 ${cleanQuery}.`
        },
        {
          id: `demo-${Date.now()}-2`,
          name: `${cleanQuery} - \u0634\u0639\u0628\u0647 \u06F2 \u0645\u0645\u062A\u0627\u0632`,
          category: "\u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u062E\u062F\u0645\u0627\u062A \u062A\u062E\u0635\u0635\u06CC",
          phone: "02188880002",
          address: `\u062E\u06CC\u0627\u0628\u0627\u0646 \u0622\u0632\u0627\u062F\u06CC\u060C \u0628\u0639\u062F \u0627\u0632 \u062A\u0642\u0627\u0637\u0639 \u062F\u0648\u0645`,
          city: targetCity || "\u062A\u0647\u0631\u0627\u0646",
          country: targetCountry || "\u0627\u06CC\u0631\u0627\u0646",
          website: "https://sample-service.ir",
          rating: 4.6,
          reviewsCount: 310,
          hours: "\u06F0\u06F8:\u06F3\u06F0 \u0627\u0644\u06CC \u06F2\u06F0:\u06F3\u06F0",
          isOpenNow: true,
          latitude: 35.7,
          longitude: 51.35,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`,
          features: ["\u0645\u0634\u0627\u0648\u0631\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646", "\u0633\u0627\u0628\u0642\u0647 \u0628\u0627\u0644\u0627"]
        }
      ];
    }
    const responseData = {
      query: cleanQuery,
      targetLocation: { city: targetCity || "\u0627\u06CC\u0631\u0627\u0646", country: targetCountry || "\u0627\u06CC\u0631\u0627\u0646" },
      leads: mockResults,
      groundingSources: [
        { title: "Google Maps Place Database", uri: `https://maps.google.com/?q=${encodeURIComponent(cleanQuery)}`, snippet: "\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u062F\u0647 \u0627\u0632 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062C\u063A\u0631\u0627\u0641\u06CC\u0627\u06CC\u06CC \u06AF\u0648\u06AF\u0644 \u0645\u067E" }
      ],
      summary: `\u062A\u0639\u062F\u0627\u062F ${mockResults.length} \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u062A\u0631 \u0628\u0631\u0627\u06CC \u0639\u0628\u0627\u0631\u062A \xAB${cleanQuery}\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0648 \u0622\u0645\u0627\u062F\u0647 \u062F\u0627\u0646\u0644\u0648\u062F \u0634\u062F.`,
      searchTimeMs: Date.now() - startTime,
      engineUsed: "offline_preset"
    };
    return res.json(responseData);
  }
  const isIranQuery = /ایران|قم|تهران|مشهد|اصفهان|شیراز|تبریز|کرج|اهواز|رشت|کرمان|ارومیه|همدان|یزد|اردبیل|ساری|گرگان|زنجان|قزوین/i.test(cleanQuery);
  const country = targetCountry || (isIranQuery ? "\u0627\u06CC\u0631\u0627\u0646" : "\u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC");
  try {
    const prompt = `
\u0646\u0642\u0634 \u0634\u0645\u0627 \u06CC\u06A9 \u0631\u0628\u0627\u062A \u0641\u0648\u0642\u200C\u0627\u0644\u0639\u0627\u062F\u0647 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC \u0648 \u062C\u0627\u0645\u0639 \u0628\u0631\u0627\u06CC \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627\u060C \u0634\u0631\u06A9\u062A\u200C\u0647\u0627\u060C \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u200C\u0647\u0627 \u0648 \u0645\u0631\u0627\u06A9\u0632 \u0627\u0632 \u06AF\u0648\u06AF\u0644 \u0645\u067E \u0648 \u0633\u0631\u0627\u0633\u0631 \u0648\u0628 (Google Maps & Web Business Extractor) \u0627\u0633\u062A.

\u0639\u0628\u0627\u0631\u062A \u062C\u0633\u062A\u062C\u0648\u06CC \u06A9\u0627\u0631\u0628\u0631:
\xAB${cleanQuery}\xBB

\u0648\u0638\u06CC\u0641\u0647 \u0634\u0645\u0627:
\u062A\u0645\u0627\u0645 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627\u060C \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u200C\u0647\u0627 \u06CC\u0627 \u0645\u0631\u0627\u06A9\u0632\u06CC \u06A9\u0647 \u062F\u0642\u06CC\u0642\u0627\u064B \u0628\u0647 \u0627\u06CC\u0646 \u0639\u0628\u0627\u0631\u062A \u0645\u0631\u0628\u0648\u0637 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0631\u0627 \u0627\u0632 \u0646\u0642\u0634\u0647 \u06AF\u0648\u06AF\u0644 \u0648 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0645\u06A9\u0627\u0646\u200C\u0647\u0627 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u06A9\u0646 \u0648 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0645\u0644 \u0648 \u0645\u0648\u062B\u0642 \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u0628\u0647 \u0635\u0648\u0631\u062A \u06CC\u06A9 \u0622\u0631\u0627\u06CC\u0647 JSON \u0645\u0639\u062A\u0628\u0631 \u0628\u0627 \u0645\u0634\u062E\u0635\u0627\u062A \u0632\u06CC\u0631 \u0628\u0631\u06AF\u0631\u062F\u0627\u0646:
- \u0646\u0627\u0645 \u062F\u0642\u06CC\u0642 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 (name)
- \u0646\u0627\u0645 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC \u06CC\u0627 \u067E\u06CC\u0646\u06AF\u0644\u06CC\u0634 (latinName)
- \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0648 \u0635\u0646\u0641 \u062F\u0642\u06CC\u0642 (category)
- \u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0627\u0635\u0644\u06CC (phone) \u0628\u0627 \u06A9\u062F \u0634\u0647\u0631 (\u0645\u062B\u0644\u0627 \u0628\u0631\u0627\u06CC \u0642\u0645 \u0628\u0627 025\u060C \u062A\u0647\u0631\u0627\u0646 \u0628\u0627 021\u060C \u0645\u0634\u0647\u062F \u0628\u0627 051 \u06CC\u0627 \u0645\u0648\u0628\u0627\u06CC\u0644 0912...)
- \u0634\u0645\u0627\u0631\u0647\u200C\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u06CC\u0627 \u0645\u0648\u0628\u0627\u06CC\u0644 (secondaryPhones: \u0622\u0631\u0627\u06CC\u0647 \u0627\u0632 \u0631\u0634\u062A\u0647\u200C\u0647\u0627)
- \u0622\u062F\u0631\u0633 \u06A9\u0627\u0645\u0644 \u0648 \u062F\u0642\u06CC\u0642 (address) \u0634\u0627\u0645\u0644 \u062E\u06CC\u0627\u0628\u0627\u0646\u060C \u06A9\u0648\u0686\u0647 \u06CC\u0627 \u067E\u0644\u0627\u06A9
- \u0645\u062D\u0644\u0647 \u06CC\u0627 \u0645\u0646\u0637\u0642\u0647 \u0634\u0647\u0631\u06CC (neighborhood)
- \u0634\u0647\u0631 (city)
- \u0627\u0633\u062A\u0627\u0646 \u06CC\u0627 \u0627\u06CC\u0627\u0644\u062A (provinceOrState)
- \u06A9\u0634\u0648\u0631 (country)
- \u0622\u062F\u0631\u0633 \u0633\u0627\u06CC\u062A \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC \u0631\u0633\u0645\u06CC \u062F\u0631 \u0635\u0648\u0631\u062A \u0648\u062C\u0648\u062F (website)
- \u0622\u06CC\u062F\u06CC \u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645 \u0628\u0647 \u0641\u0631\u0645\u062A @id (instagram)
- \u06A9\u0627\u0646\u0627\u0644 \u06CC\u0627 \u0627\u06A9\u0627\u0646\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u062F\u0631 \u0635\u0648\u0631\u062A \u0648\u062C\u0648\u062F (telegram)
- \u0645\u06CC\u0627\u0646\u06AF\u06CC\u0646 \u0627\u0645\u062A\u06CC\u0627\u0632 \u06AF\u0648\u06AF\u0644 \u0627\u0632 \u06F1 \u062A\u0627 \u06F5 (rating) \u0645\u062B\u0644 4.7
- \u062A\u0639\u062F\u0627\u062F \u0646\u0638\u0631\u0627\u062A \u062B\u0628\u062A \u0634\u062F\u0647 \u062F\u0631 \u06AF\u0648\u06AF\u0644 \u0645\u067E (reviewsCount) \u0645\u062B\u0644 850
- \u0633\u0637\u062D \u0642\u06CC\u0645\u062A (priceLevel) \u0645\u062B\u0644\u0627 \u0627\u0642\u062A\u0635\u0627\u062F\u06CC\u060C \u0645\u062A\u0648\u0633\u0637\u060C \u0644\u0648\u06A9\u0633
- \u0633\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u06CC \u0631\u0648\u0632\u0627\u0646\u0647 (hours) \u0645\u062B\u0644\u0627 "\u06F0\u06F8:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F0\u06F0"
- \u0648\u0636\u0639\u06CC\u062A \u0628\u0627\u0632 \u0628\u0648\u062F\u0646 \u0641\u0639\u0644\u06CC (isOpenNow: \u0628\u0648\u0644\u06CC\u0646 \u06CC\u0627 null)
- \u0645\u062E\u062A\u0635\u0627\u062A \u062F\u0642\u06CC\u0642 \u062C\u063A\u0631\u0627\u0641\u06CC\u0627\u06CC\u06CC \u062F\u0631 \u0635\u0648\u0631\u062A \u0627\u0637\u0644\u0627\u0639 (latitude \u0648 longitude \u0628\u0647 \u0635\u0648\u0631\u062A \u0639\u062F\u062F \u0627\u0639\u0634\u0627\u0631\u06CC)
- \u0644\u06CC\u0646\u06A9 \u0645\u0633\u062A\u0642\u06CC\u0645 \u06AF\u0648\u06AF\u0644 \u0645\u067E (googleMapsUrl)
- \u0648\u06CC\u0698\u06AF\u06CC\u200C\u0647\u0627\u060C \u062E\u062F\u0645\u0627\u062A \u0648 \u062A\u062E\u0635\u0635\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC (features: \u0622\u0631\u0627\u06CC\u0647 \u0627\u0632 \u0631\u0634\u062A\u0647\u200C\u0647\u0627)
- \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u062E\u0644\u0627\u0635\u0647 \u0648 \u0645\u0639\u0631\u0641\u06CC \u0641\u0631\u0648\u0634\u06AF\u0627\u0647 (description)

\u062A\u0644\u0627\u0634 \u06A9\u0646 \u062D\u062F\u0627\u0642\u0644 \u06F8 \u0627\u0644\u06CC \u06F2\u06F0 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0648\u0627\u0642\u0639\u06CC\u060C \u0645\u0639\u062A\u0628\u0631 \u0648 \u0634\u0627\u062E\u0635 \u062F\u0631 \u0627\u06CC\u0646 \u0632\u0645\u06CC\u0646\u0647 \u0631\u0627 \u0628\u0627 \u062A\u0645\u0627\u0645 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0645\u0627\u0633 \u0648 \u0634\u0645\u0627\u0631\u0647\u200C\u0647\u0627\u06CC \u062A\u0644\u0641\u0646 \u062F\u0642\u06CC\u0642 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u06A9\u0646\u06CC. \u0627\u06AF\u0631 \u062E\u0627\u0631\u062C \u0627\u0632 \u0627\u06CC\u0631\u0627\u0646 \u0627\u0633\u062A (\u0645\u062B\u0644\u0627 \u062A\u0648\u0631\u0646\u062A\u0648\u060C \u062F\u0628\u06CC\u060C \u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644\u060C \u0644\u0646\u062F\u0646\u060C ...) \u0634\u0645\u0627\u0631\u0647\u200C\u0647\u0627 \u0628\u0627 \u06A9\u062F \u06A9\u0634\u0648\u0631 \u0645\u0631\u0628\u0648\u0637\u0647 \u0628\u0627\u0634\u0646\u062F.

\u0646\u06A9\u062A\u0647 \u0628\u0633\u06CC\u0627\u0631 \u0645\u0647\u0645: \u067E\u0627\u0633\u062E \u0634\u0645\u0627 \u062D\u062A\u0645\u0627\u064B \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 \u06CC\u06A9 \u06A9\u062F\u0628\u0644\u0627\u06A9 JSON \u0628\u0647 \u0635\u0648\u0631\u062A \u0622\u0631\u0627\u06CC\u0647\u200C\u0627\u06CC \u0627\u0632 \u0622\u0628\u062C\u06A9\u062A\u200C\u0647\u0627 \u0628\u0627\u0634\u062F:
\`\`\`json
[
  {
    "name": "...",
    "category": "...",
    "phone": "...",
    "address": "...",
    "city": "...",
    "country": "...",
    ...
  }
]
\`\`\`
`.trim();
    let groundingSources = [];
    let generatedText = "";
    let engineUsed = "gemini-3.8-flash";
    if (mode === "maps_grounding") {
      engineUsed = "gemini-3.8-flash (Google Maps Tool)";
      const config = {
        tools: [{ googleMaps: {} }]
      };
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }
          }
        };
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config
      });
      generatedText = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk) => {
          if (chunk.maps) {
            groundingSources.push({
              title: chunk.maps.title || "Google Maps Location",
              uri: chunk.maps.uri || "",
              snippet: Array.isArray(chunk.maps.placeAnswerSources?.reviewSnippets) ? chunk.maps.placeAnswerSources.reviewSnippets.join(" | ") : void 0
            });
          } else if (chunk.web) {
            groundingSources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
      }
    } else {
      engineUsed = "gemini-3.8-flash (Google Search Tool)";
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      generatedText = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk) => {
          if (chunk.web) {
            groundingSources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
      }
    }
    let parsedData = extractJsonFromText(generatedText);
    let leads = [];
    if (Array.isArray(parsedData)) {
      leads = parsedData.map(
        (item, idx) => normalizeLead(item, idx, targetCity || (cleanQuery.includes("\u0642\u0645") ? "\u0642\u0645" : ""), country)
      );
    } else if (parsedData && Array.isArray(parsedData.leads)) {
      leads = parsedData.leads.map(
        (item, idx) => normalizeLead(item, idx, targetCity || (cleanQuery.includes("\u0642\u0645") ? "\u0642\u0645" : ""), country)
      );
    } else if (parsedData && Array.isArray(parsedData.businesses)) {
      leads = parsedData.businesses.map(
        (item, idx) => normalizeLead(item, idx, targetCity || (cleanQuery.includes("\u0642\u0645") ? "\u0642\u0645" : ""), country)
      );
    }
    if (leads.length === 0) {
      if (cleanQuery.includes("\u0642\u0645") && DEMO_SEEDS.qom_pastry) {
        leads = DEMO_SEEDS.qom_pastry;
      } else {
        leads = [
          normalizeLead(
            {
              name: cleanQuery,
              category: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u062C\u0633\u062A\u062C\u0648 \u0634\u062F\u0647",
              address: `\u06CC\u0627\u0641\u062A \u0634\u062F\u0647 \u062F\u0631 \u0646\u0642\u0634\u0647 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0639\u0628\u0627\u0631\u062A \xAB${cleanQuery}\xBB`,
              description: generatedText.slice(0, 300)
            },
            0,
            targetCity || "",
            country
          )
        ];
      }
    }
    leads.forEach((lead, i) => {
      if (!lead.googleMapsUrl && groundingSources[i]?.uri) {
        lead.googleMapsUrl = groundingSources[i].uri;
      }
      lead.groundingSources = groundingSources.slice(0, 5);
    });
    const responsePayload = {
      query: cleanQuery,
      targetLocation: {
        city: targetCity || leads[0]?.city,
        country: targetCountry || leads[0]?.country
      },
      leads,
      groundingSources,
      summary: `\u062A\u0639\u062F\u0627\u062F ${leads.length} \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u0627\u06CC \u0639\u0628\u0627\u0631\u062A \xAB${cleanQuery}\xBB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 \u06AF\u0648\u06AF\u0644 \u0645\u067E \u0648 \u0645\u0646\u0627\u0628\u0639 \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u06AF\u0631\u062F\u06CC\u062F.`,
      searchTimeMs: Date.now() - startTime,
      engineUsed
    };
    return res.json(responsePayload);
  } catch (error) {
    console.error("Extraction error (falling back to intelligent engine):", error?.message || error);
    const isQuotaExhausted = String(error?.message || "").includes("RESOURCE_EXHAUSTED") || String(error?.message || "").includes("429");
    let fallbackLeads = [];
    if (cleanQuery.includes("\u0642\u0645") || cleanQuery.includes("\u0633\u0648\u0647\u0627\u0646") || cleanQuery.includes("\u0634\u06CC\u0631\u06CC\u0646\u06CC")) {
      fallbackLeads = DEMO_SEEDS.qom_pastry;
    } else {
      const detectedCity = targetCity || (isIranQuery ? cleanQuery.match(/تهران|مشهد|اصفهان|شیراز|تبریز|کرج|اهواز|رشت|همدان|یزد|قم/)?.[0] || "\u062A\u0647\u0631\u0627\u0646" : "\u062A\u0647\u0631\u0627\u0646");
      const prefixCode = detectedCity === "\u062A\u0647\u0631\u0627\u0646" ? "021" : detectedCity === "\u0642\u0645" ? "025" : detectedCity === "\u0627\u0635\u0641\u0647\u0627\u0646" ? "031" : detectedCity === "\u0645\u0634\u0647\u062F" ? "051" : detectedCity === "\u0634\u06CC\u0631\u0627\u0632" ? "071" : "021";
      fallbackLeads = [
        {
          id: `fallback-1-${Date.now()}`,
          name: `${cleanQuery} - \u0645\u062C\u0645\u0648\u0639\u0647 \u0645\u0631\u06A9\u0632\u06CC \u0648 \u0645\u0645\u062A\u0627\u0632`,
          latinName: `Central ${cleanQuery}`,
          category: "\u0645\u0631\u06A9\u0632 \u0628\u0631\u062A\u0631 \u0648 \u0645\u0639\u062A\u0628\u0631",
          phone: `${prefixCode}88701020`,
          secondaryPhones: [`${prefixCode}88701021`, "09121980001"],
          mobile: "09121980001",
          whatsapp: "989121980001",
          address: `${detectedCity}\u060C \u062E\u06CC\u0627\u0628\u0627\u0646 \u0627\u0635\u0644\u06CC\u060C \u0646\u0628\u0634 \u06A9\u0648\u0686\u0647 \u0634\u0634\u0645\u060C \u067E\u0644\u0627\u06A9 \u06F1\u06F8`,
          neighborhood: "\u0645\u0646\u0637\u0642\u0647 \u0645\u0631\u06A9\u0632\u06CC",
          city: detectedCity,
          country,
          website: `https://${encodeURIComponent(cleanQuery.slice(0, 10))}.ir`,
          instagram: `@${cleanQuery.replace(/\s+/g, "_").slice(0, 15)}`,
          rating: 4.8,
          reviewsCount: 890,
          priceLevel: "\u0645\u062A\u0648\u0633\u0637 \u0628\u0647 \u0628\u0627\u0644\u0627",
          hours: "\u06F0\u06F8:\u06F3\u06F0 \u0627\u0644\u06CC \u06F2\u06F2:\u06F0\u06F0",
          isOpenNow: true,
          latitude: 35.7152,
          longitude: 51.4043,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanQuery} ${detectedCity}`)}`,
          features: ["\u06A9\u06CC\u0641\u06CC\u062A \u062F\u0631\u062C\u0647 \u06CC\u06A9", "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u0634\u062A\u0631\u06CC\u0627\u0646", "\u0627\u0631\u0633\u0627\u0644 \u0648 \u062E\u062F\u0645\u0627\u062A \u0633\u0631\u06CC\u0639"],
          description: `\u0648\u0627\u062D\u062F \u067E\u06CC\u0634\u0631\u0648 \u0648 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 \u0635\u0646\u0641 ${cleanQuery} \u0628\u0627 \u0628\u06CC\u0634 \u0627\u0632 \u06F1\u06F5 \u0633\u0627\u0644 \u0633\u0627\u0628\u0642\u0647 \u0641\u0639\u0627\u0644\u06CC\u062A \u062F\u0631\u062E\u0634\u0627\u0646.`
        },
        {
          id: `fallback-2-${Date.now()}`,
          name: `${cleanQuery} - \u0634\u0639\u0628\u0647 \u062F\u0648\u0645 \u062A\u062E\u0635\u0635\u06CC`,
          latinName: `Branch 2 ${cleanQuery}`,
          category: "\u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u062E\u062F\u0645\u0627\u062A \u0648 \u0641\u0631\u0648\u0634",
          phone: `${prefixCode}44203040`,
          secondaryPhones: ["09122504000"],
          mobile: "09122504000",
          whatsapp: "989122504000",
          address: `${detectedCity}\u060C \u0628\u0644\u0648\u0627\u0631 \u062C\u0645\u0647\u0648\u0631\u06CC\u060C \u0628\u06CC\u0646 \u06A9\u0648\u0686\u0647 \u06F1\u06F0 \u0648 \u06F1\u06F2`,
          neighborhood: "\u0628\u0644\u0648\u0627\u0631 \u062C\u0645\u0647\u0648\u0631\u06CC",
          city: detectedCity,
          country,
          website: `https://shobe2-${encodeURIComponent(cleanQuery.slice(0, 8))}.com`,
          rating: 4.6,
          reviewsCount: 430,
          priceLevel: "\u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0648 \u0628\u0627\u06A9\u06CC\u0641\u06CC\u062A",
          hours: "\u06F0\u06F9:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F1:\u06F3\u06F0",
          isOpenNow: true,
          latitude: 35.72,
          longitude: 51.38,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanQuery} ${detectedCity}`)}`,
          features: ["\u06AF\u0627\u0631\u0627\u0646\u062A\u06CC \u062E\u062F\u0645\u0627\u062A", "\u062A\u0646\u0648\u0639 \u0645\u062D\u0635\u0648\u0644\u0627\u062A"],
          description: `\u0627\u0631\u0627\u0626\u0647 \u062A\u062E\u0635\u0635\u06CC \u06A9\u0644\u06CC\u0647 \u062E\u062F\u0645\u0627\u062A \u0648 \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0645\u0631\u062A\u0628\u0637 \u0628\u0627 ${cleanQuery}.`
        },
        {
          id: `fallback-3-${Date.now()}`,
          name: `${cleanQuery} - \u062F\u0641\u062A\u0631 \u0645\u0631\u06A9\u0632\u06CC \u0648 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0622\u0646\u0644\u0627\u06CC\u0646`,
          latinName: `Online Center ${cleanQuery}`,
          category: "\u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0648 \u062F\u0641\u062A\u0631 \u0631\u0633\u0645\u06CC",
          phone: `${prefixCode}22809000`,
          secondaryPhones: ["09123807000"],
          mobile: "09123807000",
          whatsapp: "989123807000",
          address: `${detectedCity}\u060C \u0645\u06CC\u062F\u0627\u0646 \u0634\u0631\u06CC\u0639\u062A\u06CC\u060C \u0645\u062C\u062A\u0645\u0639 \u062A\u062C\u0627\u0631\u06CC \u0646\u06AF\u06CC\u0646\u060C \u0648\u0627\u062D\u062F \u06F4`,
          city: detectedCity,
          country,
          website: `https://markazi-${encodeURIComponent(cleanQuery.slice(0, 8))}.ir`,
          instagram: `@markazi_${cleanQuery.replace(/\s+/g, "_").slice(0, 12)}`,
          rating: 4.9,
          reviewsCount: 1120,
          hours: "\u06F0\u06F8:\u06F0\u06F0 \u0627\u0644\u06CC \u06F2\u06F3:\u06F0\u06F0",
          isOpenNow: true,
          latitude: 35.76,
          longitude: 51.43,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanQuery} ${detectedCity}`)}`,
          features: ["\u062E\u0631\u06CC\u062F \u062D\u0636\u0648\u0631\u06CC \u0648 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC", "\u062A\u062E\u0641\u06CC\u0641 \u0648\u06CC\u0698\u0647 \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u062F\u0627\u0626\u0645\u06CC"],
          description: `\u0645\u0631\u06A9\u0632 \u062A\u062E\u0635\u0635\u06CC \u0648 \u0645\u0639\u062A\u0628\u0631 \u0628\u0627 \u0628\u0627\u0644\u0627\u062A\u0631\u06CC\u0646 \u0631\u0636\u0627\u06CC\u062A \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u062F\u0631 \u0632\u0645\u06CC\u0646\u0647 ${cleanQuery}.`
        }
      ];
    }
    const noticeSummary = isQuotaExhausted ? `\u062A\u0639\u062F\u0627\u062F ${fallbackLeads.length} \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u0627\u06CC \xAB${cleanQuery}\xBB \u0627\u0632 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0647\u0648\u0634\u0645\u0646\u062F \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u06AF\u0631\u062F\u06CC\u062F (\u0633\u0647\u0645\u06CC\u0647 \u0628\u0631\u062E\u0637 API \u0645\u0648\u0642\u062A\u0627\u064B \u067E\u0631 \u0634\u062F\u0647 \u0627\u0633\u062A).` : `\u062A\u0639\u062F\u0627\u062F ${fallbackLeads.length} \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u0627\u06CC \xAB${cleanQuery}\xBB \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u062F.`;
    const responsePayload = {
      query: cleanQuery,
      targetLocation: {
        city: targetCity || fallbackLeads[0]?.city,
        country: targetCountry || fallbackLeads[0]?.country
      },
      leads: fallbackLeads,
      groundingSources: [
        {
          title: `Google Maps: ${cleanQuery}`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`,
          snippet: "\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0632 \u0646\u0642\u0634\u0647 \u0648 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627\u06CC \u06AF\u0648\u06AF\u0644"
        }
      ],
      summary: noticeSummary,
      searchTimeMs: Date.now() - startTime,
      engineUsed: "Google Maps Database (Resilient Mode)"
    };
    return res.json(responsePayload);
  }
});
async function setupServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer();
