import type { BusinessLead } from '../types/business.ts';

/**
 * Escapes CSV values and wraps in quotes if needed
 */
function escapeCsvValue(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates CSV string with UTF-8 BOM so Excel opens Persian/Arabic text correctly
 */
export function generateCsv(leads: BusinessLead[]): string {
  const headers = [
    'نام کسب‌وکار',
    'دسته‌بندی',
    'شماره تلفن اصلی',
    'شماره‌های دیگر',
    'شهر',
    'محله',
    'آدرس کامل',
    'وب‌سایت',
    'اینستاگرام',
    'امتیاز گوگل',
    'تعداد نظرات',
    'ساعت کاری',
    'لینک گوگل مپ',
    'عرض جغرافیایی (Latitude)',
    'طول جغرافیایی (Longitude)',
    'توضیحات و خدمات',
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.category || '',
    lead.phone || '',
    (lead.secondaryPhones || []).join(' | '),
    lead.city || '',
    lead.neighborhood || '',
    lead.address || '',
    lead.website || '',
    lead.instagram || '',
    lead.rating !== undefined ? lead.rating : '',
    lead.reviewsCount !== undefined ? lead.reviewsCount : '',
    lead.hours || '',
    lead.googleMapsUrl || '',
    lead.latitude !== undefined ? lead.latitude : '',
    lead.longitude !== undefined ? lead.longitude : '',
    (lead.features || []).concat(lead.description ? [lead.description] : []).join(' - '),
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n');

  // Prepend UTF-8 Byte Order Mark (BOM)
  return '\uFEFF' + csvContent;
}

/**
 * Generates standard vCard 3.0 (.vcf) format for direct import into phones
 */
export function generateVcf(leads: BusinessLead[]): string {
  const vcards = leads.map((lead) => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${lead.name}`,
      lead.latinName ? `N;CHARSET=UTF-8:;${lead.latinName};;;` : `N;CHARSET=UTF-8:;${lead.name};;;`,
      lead.category ? `ORG;CHARSET=UTF-8:${lead.category}` : 'ORG;CHARSET=UTF-8:کسب‌وکار',
    ];

    if (lead.phone) {
      lines.push(`TEL;TYPE=WORK,VOICE:${lead.phone}`);
    }
    if (lead.mobile && lead.mobile !== lead.phone) {
      lines.push(`TEL;TYPE=CELL,VOICE:${lead.mobile}`);
    }
    if (lead.secondaryPhones) {
      lead.secondaryPhones.forEach((p) => {
        lines.push(`TEL;TYPE=OTHER:${p}`);
      });
    }
    if (lead.address) {
      lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${lead.address};${lead.city || ''};;;${lead.country || 'Iran'}`);
    }
    if (lead.website) {
      lines.push(`URL:${lead.website}`);
    }
    const noteParts: string[] = [];
    if (lead.instagram) noteParts.push(`Instagram: ${lead.instagram}`);
    if (lead.googleMapsUrl) noteParts.push(`Google Maps: ${lead.googleMapsUrl}`);
    if (lead.rating) noteParts.push(`Rating: ${lead.rating} (${lead.reviewsCount || 0} reviews)`);
    if (noteParts.length > 0) {
      lines.push(`NOTE;CHARSET=UTF-8:${noteParts.join(' | ')}`);
    }

    lines.push('END:VCARD');
    return lines.join('\r\n');
  });

  return vcards.join('\r\n');
}

/**
 * Formats phone numbers as a clean list for SMS marketing or bulk broadcast
 */
export function extractPhoneNumbersList(leads: BusinessLead[], separator: '\n' | ', ' = '\n'): string {
  const numbers: string[] = [];
  leads.forEach((l) => {
    if (l.phone && !numbers.includes(l.phone)) {
      numbers.push(l.phone);
    }
    if (l.secondaryPhones) {
      l.secondaryPhones.forEach((p) => {
        if (p && !numbers.includes(p)) {
          numbers.push(p);
        }
      });
    }
  });
  return numbers.join(separator);
}

/**
 * Browser file download helper
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
