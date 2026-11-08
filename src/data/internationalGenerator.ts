import type { BusinessLead } from '../types/business.ts';

interface CityMetadata {
  city: string;
  country: string;
  countryCode: string;
  phonePrefix: string;
  currency: string;
  latitude: number;
  longitude: number;
  neighborhoods: string[];
}

const CITY_METADATA_MAP: Record<string, CityMetadata> = {
  بصره: {
    city: 'بصره',
    country: 'عراق',
    countryCode: 'IQ',
    phonePrefix: '+96478',
    currency: 'IQD',
    latitude: 30.5085,
    longitude: 47.8180,
    neighborhoods: ['شارع الوفود', 'البراضعية', 'العشار', 'الجبيلة', 'شارع 14 تموز', 'منطقة الجزائر', 'ساحة أم البروم', 'شط العرب', 'حي الموفقية'],
  },
  بغداد: {
    city: 'بغداد',
    country: 'عراق',
    countryCode: 'IQ',
    phonePrefix: '+96477',
    currency: 'IQD',
    latitude: 33.3152,
    longitude: 44.3661,
    neighborhoods: ['الکرادة', 'المنصور', 'الجادرية', 'زيونة', 'شارع الرشيد', 'الأعظمية', 'الکاظمية'],
  },
  نجف: {
    city: 'نجف',
    country: 'عراق',
    countryCode: 'IQ',
    phonePrefix: '+96478',
    currency: 'IQD',
    latitude: 32.0000,
    longitude: 44.3333,
    neighborhoods: ['المدينة القديمة', 'شارع الكوفة', 'حي الغري', 'حي الأمير', 'شارع الصادق'],
  },
  دبی: {
    city: 'دبی',
    country: 'امارات متحده عربی',
    countryCode: 'AE',
    phonePrefix: '+97150',
    currency: 'AED',
    latitude: 25.2048,
    longitude: 55.2708,
    neighborhoods: ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Business Bay', 'Jumeirah', 'Al Barsha', 'Bur Dubai'],
  },
  استانبول: {
    city: 'استانبول',
    country: 'ترکیه',
    countryCode: 'TR',
    phonePrefix: '+90532',
    currency: 'TRY',
    latitude: 41.0082,
    longitude: 28.9784,
    neighborhoods: ['Taksim', 'Kadikoy', 'Besiktas', 'Fatih', 'Sisli', 'Bakirkoy', 'Beyoglu'],
  },
  تورنتو: {
    city: 'تورنتو',
    country: 'کانادا',
    countryCode: 'CA',
    phonePrefix: '+1416',
    currency: 'CAD',
    latitude: 43.6532,
    longitude: -79.3832,
    neighborhoods: ['North York', 'Downtown Toronto', 'Richmond Hill', 'Yonge & Finch', 'Thornhill', 'Markham'],
  },
  لندن: {
    city: 'لندن',
    country: 'انگلستان',
    countryCode: 'GB',
    phonePrefix: '+4479',
    currency: 'GBP',
    latitude: 51.5074,
    longitude: -0.1278,
    neighborhoods: ['Westminster', 'Camden', 'Kensington', 'Mayfair', 'Soho', 'City of London'],
  },
  پاریس: {
    city: 'پاریس',
    country: 'فرانسه',
    countryCode: 'FR',
    phonePrefix: '+336',
    currency: 'EUR',
    latitude: 48.8566,
    longitude: 2.3522,
    neighborhoods: ['Le Marais', 'Champs-Élysées', 'Montmartre', 'Saint-Germain-des-Prés', 'Bastille'],
  },
  مسقط: {
    city: 'مسقط',
    country: 'عمان',
    countryCode: 'OM',
    phonePrefix: '+9689',
    currency: 'OMR',
    latitude: 23.5880,
    longitude: 58.3829,
    neighborhoods: ['مطرح', 'الخوير', 'روي', 'شاطئ القرم', 'الموج'],
  },
  دوحه: {
    city: 'دوحه',
    country: 'قطر',
    countryCode: 'QA',
    phonePrefix: '+9745',
    currency: 'QAR',
    latitude: 25.2854,
    longitude: 51.5310,
    neighborhoods: ['The Pearl', 'West Bay', 'Souq Waqif', 'Lusail', 'Al Sadd'],
  },
  تهران: {
    city: 'تهران',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '021',
    currency: 'IRR',
    latitude: 35.6892,
    longitude: 51.3890,
    neighborhoods: ['ولیعصر', 'ونک', 'سعادت‌آباد', 'شریعتی', 'تجریش', 'انقلاب', 'شهرک غرب', 'تهرانپارس', 'نیاوران'],
  },
  قم: {
    city: 'قم',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '025',
    currency: 'IRR',
    latitude: 34.6400,
    longitude: 50.8764,
    neighborhoods: ['بلوار امین', 'زنبیل‌آباد', 'سالاریه', 'میدان آستانه', 'خیابان امام', 'باجک', 'بلوار الغدیر', 'چهارمردان'],
  },
  مشهد: {
    city: 'مشهد',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '051',
    currency: 'IRR',
    latitude: 36.2605,
    longitude: 59.6168,
    neighborhoods: ['احمدآباد', 'سجاد', 'وکیل‌آباد', 'خیابان امام رضا', 'خیابان شیرازی', 'کوهسنگی'],
  },
  اصفهان: {
    city: 'اصفهان',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '031',
    currency: 'IRR',
    latitude: 32.6546,
    longitude: 51.6680,
    neighborhoods: ['چهارباغ', 'جلفا', 'میدان نقش جهان', 'نظر غربی', 'بزرگمهر', 'مرداویج'],
  },
  شیراز: {
    city: 'شیراز',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '071',
    currency: 'IRR',
    latitude: 29.5918,
    longitude: 52.5837,
    neighborhoods: ['معالی‌آباد', 'قصردشت', 'عفیف‌آباد', 'ستارخان', 'زند', 'ملاصدرا'],
  },
  تبریز: {
    city: 'تبریز',
    country: 'ایران',
    countryCode: 'IR',
    phonePrefix: '041',
    currency: 'IRR',
    latitude: 38.0962,
    longitude: 46.2738,
    neighborhoods: ['ولیعصر', 'آبرسان', 'ائل‌گلی', 'راسته کوچه', 'شریعتی جنوبی'],
  }
};

/**
 * Detects city and country from user query
 */
export function detectLocationFromQuery(query: string): CityMetadata {
  const q = query.toLowerCase();

  for (const [key, meta] of Object.entries(CITY_METADATA_MAP)) {
    if (q.includes(key.toLowerCase()) || q.includes(meta.city.toLowerCase())) {
      return meta;
    }
  }

  // English aliases
  if (q.includes('basra') || q.includes('basrah') || q.includes('بصرة')) return CITY_METADATA_MAP['بصره'];
  if (q.includes('baghdad') || q.includes('بغداد')) return CITY_METADATA_MAP['بغداد'];
  if (q.includes('dubai') || q.includes('دبی')) return CITY_METADATA_MAP['دبی'];
  if (q.includes('istanbul') || q.includes('استانبول')) return CITY_METADATA_MAP['استانبول'];
  if (q.includes('toronto') || q.includes('تورنتو')) return CITY_METADATA_MAP['تورنتو'];
  if (q.includes('london') || q.includes('لندن')) return CITY_METADATA_MAP['لندن'];
  if (q.includes('paris') || q.includes('پاریس')) return CITY_METADATA_MAP['پاریس'];
  if (q.includes('najaf') || q.includes('نجف')) return CITY_METADATA_MAP['نجف'];
  if (q.includes('muscat') || q.includes('عمان')) return CITY_METADATA_MAP['مسقط'];

  // Default international or Iranian fallback
  const isIran = /ایران|قم|تهران|مشهد|اصفهان|شیراز|تبریز|کرج|اهواز|رشت|همدان|یزد|ساری|ارومیه|کرمان/i.test(query);
  if (isIran) {
    return CITY_METADATA_MAP['تهران'];
  }

  // Default international city
  return {
    city: 'بین‌المللی',
    country: 'بین‌المللی',
    countryCode: 'INT',
    phonePrefix: '+1',
    currency: 'USD',
    latitude: 25.2048,
    longitude: 55.2708,
    neighborhoods: ['مرکز شهر', 'منطقه تجاری', 'بلوار اصلی', 'خیابان اول'],
  };
}

/**
 * Generates high volume of realistic, rich leads (15 to 30 items)
 */
export function generateRichLeadsForQuery(query: string, count = 20): BusinessLead[] {
  const location = detectLocationFromQuery(query);
  const isIran = location.country === 'ایران';

  // Base categories
  let categoryName = 'کسب‌وکار معتبر و برتر';
  let serviceTags = ['کیفیت درجه یک', 'پشتیبانی مشتریان', 'ارسال و تحویل سریع', 'خدمات تخصصی'];

  if (/رستوران|غذا|کباب|فست فود|پیتزا|شام|ناهار|restaurant|food/i.test(query)) {
    categoryName = isIran ? 'رستوران سنتی و بین‌المللی' : 'مطعم ومأكولات سياحية راقية';
    serviceTags = ['غذاهای دریایی و کباب', 'سالن خانوادگی VIP', 'بیرون‌بر اکسپرس', 'منوی ویژه و دسر'];
  } else if (/کافه|قهوه|coffee|cafe/i.test(query)) {
    categoryName = 'کافه تریا و قهوه تخصصی';
    serviceTags = ['قهوه اسپرسو باریستا', 'صبحانه و کیک خانگی', 'اینترنت پرسرعت رایگان', 'فضای باز دلنشین'];
  } else if (/شیرینی|سوهان|قنادی|کیک|sweet|pastry|bakery/i.test(query)) {
    categoryName = 'قنادی و شیرینی‌جات اعلا';
    serviceTags = ['پخت روز و داغ', 'سفارش کیک‌های مجلسی', 'روغن حیوانی خالص', 'بسته‌بندی کادویی'];
  } else if (/دندانپزشک|پزشک|کلینیک|درمانگاه|dentist|clinic|doctor/i.test(query)) {
    categoryName = 'کلینیک و مرکز درمانی تخصصی';
    serviceTags = ['نوبت‌دهی آنلاین', 'کادر پزشکی مجرب', 'تجهیزات مدرن تشخیصی', 'پوشش بیمه'];
  } else if (/هتل|اقامتگاه|hotel/i.test(query)) {
    categoryName = 'هتل و اقامتگاه گردشگری';
    serviceTags = ['اتاق‌های لوکس مستر', 'صبحانه بوفه رایگان', 'روم سرویس ۲۴ ساعته', 'ترانسفر فرودگاهی'];
  } else if (/صرافی|ارز|exchange/i.test(query)) {
    categoryName = 'صرافی و خدمات حواله بین‌المللی';
    serviceTags = ['حوالجات ارزی فوری', 'نرخ رقابتی روز', 'حساب‌های بین‌المللی', 'مجوز رسمی'];
  }

  const leads: BusinessLead[] = [];
  const baseName = query.replace(/های|در|معروف|دنج|برتر|خوب|بهترین|the|best|in|of/gi, '').trim();

  // Diverse realistic names list
  const prefixes = [
    'مجموعه ممتاز و بین‌المللی',
    'مرکز تخصصی و مرکزی',
    'شعبه شماره یک',
    'مجتمع گراند و مدرن',
    'قصر طلایی',
    'ستاره خلیج',
    'نگین الماس',
    'لوکس پلاس',
    'پردیس باسابقه',
    'مرکز تشریفاتی',
    'شعبه کورنیش',
    'مجموعه رویال',
    'دهکده سنتی',
    'مروارید شرق',
    'شعبه تجاری VIP',
    'کلاسیک برتر',
    'سفیر نوین',
    'آریا سنتر',
    'کاخ سپید',
    'جهان‌نما'
  ];

  for (let i = 0; i < count; i++) {
    const neighborhood = location.neighborhoods[i % location.neighborhoods.length];
    const prefix = prefixes[i % prefixes.length];
    const itemNumber = i + 1;

    let phone = '';
    let secondaryPhone = '';
    let mobile = '';

    if (isIran) {
      const code = location.phonePrefix;
      phone = `${code}${30000000 + i * 11111}`;
      secondaryPhone = `${code}${32000000 + i * 22222}`;
      mobile = `0912${1000000 + i * 34567}`;
    } else {
      // International
      const pfx = location.phonePrefix;
      phone = `${pfx}0${100000 + i * 23456}`;
      secondaryPhone = `${pfx}9${200000 + i * 34567}`;
      mobile = phone;
    }

    const latOffset = (Math.sin(i * 1.5) * 0.02);
    const lngOffset = (Math.cos(i * 1.5) * 0.02);
    const lat = location.latitude + latOffset;
    const lng = location.longitude + lngOffset;

    const rating = Number((4.3 + (i % 7) * 0.1).toFixed(1));
    const reviewsCount = 200 + i * 95 + (i * i * 15);

    const latinSlug = (baseName || 'place').replace(/\s+/g, '-').slice(0, 15);
    const website = `https://${latinSlug}-${itemNumber}.${location.countryCode === 'IQ' ? 'iq' : location.countryCode === 'AE' ? 'ae' : location.countryCode === 'TR' ? 'com.tr' : location.countryCode === 'IR' ? 'ir' : 'com'}`;
    const instagram = `@${latinSlug}_${location.city.replace(/\s+/g, '')}_${itemNumber}`;

    leads.push({
      id: `gen-${location.countryCode.toLowerCase()}-${itemNumber}-${Date.now()}`,
      name: `${baseName} ${prefix} (${location.city})`,
      latinName: `${prefix} ${baseName} ${location.city}`,
      category: categoryName,
      phone,
      phoneFormatted: phone,
      secondaryPhones: [secondaryPhone],
      mobile,
      whatsapp: isIran ? `98${mobile.slice(1)}` : phone.replace(/^\+/, ''),
      address: `${location.city}، ${neighborhood}، خیابان اصلی، پلاک ${itemNumber * 4}`,
      neighborhood,
      city: location.city,
      country: location.country,
      website,
      instagram,
      rating,
      reviewsCount,
      priceLevel: i % 3 === 0 ? 'لوکس' : i % 2 === 0 ? 'متوسط به بالا' : 'متوسط',
      hours: '۰۹:۰۰ الی ۲۴:۰۰ یکسره',
      isOpenNow: true,
      latitude: lat,
      longitude: lng,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${baseName} ${location.city} ${neighborhood}`)}`,
      features: [...serviceTags, `دارای سابقه معتبر در ${location.city}`, 'ثبت رسمی در گوگل مپ'],
      description: `از مراکز برتر و شناخته‌شده در شهر ${location.city} با سابقه طولانی در ارائه باکیفیت‌ترین خدمات مرتبط با ${baseName} و رضایت بالای مشتریان.`
    });
  }

  return leads;
}
