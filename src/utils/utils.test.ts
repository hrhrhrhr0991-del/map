import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertPersianDigitsToEnglish,
  cleanPhoneNumber,
  isIranMobile,
  formatForWhatsApp,
  normalizeInstagram,
  normalizeWebsite,
  extractJsonFromText,
  normalizeLead,
} from './parserUtils';
import {
  generateCsv,
  generateVcf,
  extractPhoneNumbersList,
} from './exportUtils';
import type { BusinessLead } from '../types/business.ts';

test('convertPersianDigitsToEnglish properly converts Persian and Arabic digits', () => {
  assert.equal(convertPersianDigitsToEnglish('۰۹۱۲۳۴۵۶۷۸۹'), '09123456789');
  assert.equal(convertPersianDigitsToEnglish('٠١٢٣٤٥٦٧٨٩'), '0123456789');
  assert.equal(convertPersianDigitsToEnglish('خیابان ۱۲ پلاک ۴'), 'خیابان 12 پلاک 4');
});

test('cleanPhoneNumber strips spaces and special characters', () => {
  assert.equal(cleanPhoneNumber('۰۲۵-۳۷۷۴-۰۰۰۰'), '02537740000');
  assert.equal(cleanPhoneNumber('+98 (912) 345 6789'), '+989123456789');
});

test('isIranMobile detects standard Iranian cell numbers', () => {
  assert.equal(isIranMobile('09123456789'), true);
  assert.equal(isIranMobile('+989351234567'), true);
  assert.equal(isIranMobile('02537740000'), false);
  assert.equal(isIranMobile('02188888888'), false);
});

test('formatForWhatsApp formats Iranian phone numbers with international code', () => {
  assert.equal(formatForWhatsApp('09123456789'), '989123456789');
  assert.equal(formatForWhatsApp('+989123456789'), '989123456789');
});

test('normalizeInstagram formats usernames and handles', () => {
  const res1 = normalizeInstagram('https://instagram.com/sohan_qom');
  assert.equal(res1?.handle, '@sohan_qom');
  assert.equal(res1?.url, 'https://instagram.com/sohan_qom');

  const res2 = normalizeInstagram('@pastry_house/');
  assert.equal(res2?.handle, '@pastry_house');
});

test('normalizeWebsite ensures protocol is present', () => {
  assert.equal(normalizeWebsite('sohan-saedinia.com'), 'https://sohan-saedinia.com');
  assert.equal(normalizeWebsite('http://example.com'), 'http://example.com');
  assert.equal(normalizeWebsite(''), '');
});

test('extractJsonFromText handles raw text, markdown blocks and enclosed arrays', () => {
  const direct = '[{"name": "شیرینی ساعدی‌نیا"}]';
  assert.deepEqual(extractJsonFromText(direct), [{ name: 'شیرینی ساعدی‌نیا' }]);

  const markdown = 'Here are the results:\n```json\n[{"name": "سوهان خودکار", "phone": "02537730000"}]\n```\nHope this helps!';
  assert.deepEqual(extractJsonFromText(markdown), [{ name: 'سوهان خودکار', phone: '02537730000' }]);
});

test('normalizeLead handles imperfect lead data gracefully', () => {
  const raw = {
    title: 'شیرینی بوعلی',
    phone: '۰۲۵-۳۷۷۰۱۱۱۱',
    city: 'قم',
    rating: '4.8',
    reviewsCount: '150',
    instagram: 'boali_confectionery',
  };
  const lead = normalizeLead(raw, 0, 'قم');
  assert.equal(lead.name, 'شیرینی بوعلی');
  assert.equal(lead.phone, '02537701111');
  assert.equal(lead.rating, 4.8);
  assert.equal(lead.reviewsCount, 150);
  assert.equal(lead.instagram, '@boali_confectionery');
  assert.equal(lead.city, 'قم');
  assert.equal(lead.country, 'ایران');
});

test('generateCsv prepends UTF-8 BOM and headers', () => {
  const mockLeads: BusinessLead[] = [
    {
      id: '1',
      name: 'قنادی شیرین',
      category: 'شیرینی‌فروشی',
      phone: '02537700000',
      address: 'قم خیابان باجک',
      city: 'قم',
      country: 'ایران',
      rating: 4.5,
      reviewsCount: 80,
    },
  ];
  const csv = generateCsv(mockLeads);
  assert.equal(csv.startsWith('\uFEFF'), true);
  assert.equal(csv.includes('قنادی شیرین'), true);
  assert.equal(csv.includes('02537700000'), true);
});

test('generateVcf outputs standard vCard 3.0 blocks', () => {
  const mockLeads: BusinessLead[] = [
    {
      id: '1',
      name: 'سوهان ساعدی نیا',
      category: 'سوهان‌پزی',
      phone: '02537740000',
      mobile: '09121510000',
      address: 'قم بلوار امین',
      city: 'قم',
      country: 'ایران',
      website: 'https://saedinia.com',
    },
  ];
  const vcf = generateVcf(mockLeads);
  assert.equal(vcf.includes('BEGIN:VCARD'), true);
  assert.equal(vcf.includes('FN;CHARSET=UTF-8:سوهان ساعدی نیا'), true);
  assert.equal(vcf.includes('TEL;TYPE=WORK,VOICE:02537740000'), true);
  assert.equal(vcf.includes('TEL;TYPE=CELL,VOICE:09121510000'), true);
  assert.equal(vcf.includes('END:VCARD'), true);
});

test('extractPhoneNumbersList outputs unique deduplicated numbers', () => {
  const mockLeads: BusinessLead[] = [
    {
      id: '1',
      name: 'تست ۱',
      category: 'تست',
      phone: '09121111111',
      address: 'آدرس ۱',
      city: 'قم',
      country: 'ایران',
    },
    {
      id: '2',
      name: 'تست ۲',
      category: 'تست',
      phone: '09121111111', // duplicate
      secondaryPhones: ['02537777777'],
      address: 'آدرس ۲',
      city: 'قم',
      country: 'ایران',
    },
  ];
  const list = extractPhoneNumbersList(mockLeads, ', ');
  assert.equal(list, '09121111111, 02537777777');
});
