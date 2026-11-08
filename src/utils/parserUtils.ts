import type { BusinessLead, GroundingSource } from '../types/business.ts';

/**
 * Converts Persian and Arabic digits to standard ASCII digits
 */
export function convertPersianDigitsToEnglish(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result
      .replace(new RegExp(persianDigits[i], 'g'), i.toString())
      .replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

/**
 * Cleans and standardizes phone number strings
 */
export function cleanPhoneNumber(rawPhone: string, defaultCountry = 'Iran'): string {
  if (!rawPhone) return '';
  const converted = convertPersianDigitsToEnglish(rawPhone);
  // Remove spaces, hyphens, parentheses
  const cleaned = converted.replace(/[\s\(\)\-\.]/g, '');
  return cleaned;
}

/**
 * Determines if a phone number is an Iranian mobile number (e.g., 0912...)
 */
export function isIranMobile(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return /^(\+98|0098|98|0)?9\d{9}$/.test(cleaned);
}

/**
 * Formats a phone number for international dial / WhatsApp
 */
export function formatForWhatsApp(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return '';
  let standard = cleaned.replace(/^00/, '').replace(/^\+/, '');
  if (standard.startsWith('09')) {
    standard = '98' + standard.slice(1);
  } else if (standard.startsWith('9') && standard.length === 10) {
    standard = '98' + standard;
  }
  return standard;
}

/**
 * Cleans Instagram handle to standard @username and url
 */
export function normalizeInstagram(input: string): { handle: string; url: string } | null {
  if (!input) return null;
  let clean = input.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
  clean = clean.replace(/[\/\?].*$/, '');
  clean = clean.replace(/^@/, '');
  if (!clean || clean.length < 2) return null;
  return {
    handle: `@${clean}`,
    url: `https://instagram.com/${clean}`,
  };
}

/**
 * Cleans website URL to have http/https prefix
 */
export function normalizeWebsite(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Robustly parses JSON from raw LLM output, handling markdown blocks or surrounded text
 */
export function extractJsonFromText(rawText: string): any {
  if (!rawText) return null;
  let text = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Continue with regex extraction
  }

  // Check for ```json ... ``` code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // Continue to next heuristic
    }
  }

  // Find array [ ... ]
  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const arrayStr = text.substring(arrayStart, arrayEnd + 1);
    try {
      return JSON.parse(arrayStr);
    } catch {
      // Continue to next heuristic
    }
  }

  // Find object { ... }
  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    const objStr = text.substring(objStart, objEnd + 1);
    try {
      return JSON.parse(objStr);
    } catch {
      // Fail
    }
  }

  return null;
}

/**
 * Normalizes raw extracted objects into strict BusinessLead entities
 */
export function normalizeLead(item: any, index: number, defaultCity = '', defaultCountry = 'ایران'): BusinessLead {
  const name = String(item.name || item.title || item.businessName || `کسب‌وکار ${index + 1}`).trim();
  const phone = cleanPhoneNumber(String(item.phone || item.phoneNumber || item.tel || ''));
  const address = String(item.address || item.fullAddress || item.location || '').trim();
  const city = String(item.city || defaultCity || '').trim();
  const country = String(item.country || defaultCountry || (city.includes('قم') || city.includes('تهران') || city.includes('مشهد') || city.includes('اصفهان') ? 'ایران' : 'ایران')).trim();

  const rawInstagram = String(item.instagram || item.ig || item.instagramHandle || '');
  const instaObj = normalizeInstagram(rawInstagram);

  const website = normalizeWebsite(item.website || item.site || item.url);

  let lat = item.latitude !== undefined ? Number(item.latitude) : undefined;
  let lng = item.longitude !== undefined ? Number(item.longitude) : undefined;
  if (isNaN(lat as number)) lat = undefined;
  if (isNaN(lng as number)) lng = undefined;

  let googleMapsUrl = item.googleMapsUrl || item.mapUrl || item.mapsLink || item.uri;
  if (!googleMapsUrl) {
    if (lat && lng) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else if (name && city) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
    }
  }

  let rating = item.rating ? Number(item.rating) : undefined;
  if (rating !== undefined && (isNaN(rating) || rating <= 0 || rating > 5)) {
    rating = undefined;
  }

  let reviewsCount = item.reviewsCount ? Number(item.reviewsCount) : undefined;
  if (reviewsCount !== undefined && isNaN(reviewsCount)) {
    reviewsCount = undefined;
  }

  const features = Array.isArray(item.features)
    ? item.features.map(String)
    : typeof item.features === 'string'
    ? item.features.split(/[,،-]/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  const secondaryPhones: string[] = [];
  if (Array.isArray(item.secondaryPhones)) {
    item.secondaryPhones.forEach((p: any) => {
      const cleaned = cleanPhoneNumber(String(p));
      if (cleaned && cleaned !== phone && !secondaryPhones.includes(cleaned)) {
        secondaryPhones.push(cleaned);
      }
    });
  }

  return {
    id: String(item.id || `lead-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`),
    name,
    latinName: item.latinName ? String(item.latinName).trim() : undefined,
    category: String(item.category || item.type || 'کسب‌وکار').trim(),
    phone,
    phoneFormatted: phone,
    secondaryPhones: secondaryPhones.length > 0 ? secondaryPhones : undefined,
    mobile: isIranMobile(phone) ? phone : undefined,
    whatsapp: formatForWhatsApp(phone),
    address: address || `${city} - ثبت شده در گوگل مپ`,
    neighborhood: item.neighborhood ? String(item.neighborhood).trim() : undefined,
    city: city || 'نامشخص',
    provinceOrState: item.provinceOrState ? String(item.provinceOrState).trim() : undefined,
    country: country || 'ایران',
    website: website || undefined,
    instagram: instaObj ? instaObj.handle : undefined,
    telegram: item.telegram ? String(item.telegram).trim() : undefined,
    rating,
    reviewsCount,
    priceLevel: item.priceLevel ? String(item.priceLevel) : undefined,
    hours: item.hours ? String(item.hours) : undefined,
    isOpenNow: typeof item.isOpenNow === 'boolean' ? item.isOpenNow : null,
    latitude: lat,
    longitude: lng,
    googleMapsUrl,
    features: features.length > 0 ? features : undefined,
    description: item.description ? String(item.description).trim() : undefined,
  };
}
