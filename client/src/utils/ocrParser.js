import { createWorker } from 'tesseract.js';

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

/**
 * Normalizes any matched date string into YYYY-MM-DD
 */
export function normalizeDateString(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.trim().replace(/[,]/g, '');

  // 1. Format: DD-Mon-YYYY or DD Mon YYYY (e.g. 15 Nov 2026, 05-DEC-26)
  const alphaMatch = clean.match(/(\d{1,2})[-/\s.]([A-Za-z]{3,9})[-/\s.](\d{2,4})/i);
  if (alphaMatch) {
    let day = alphaMatch[1].padStart(2, '0');
    let monthName = alphaMatch[2].toLowerCase();
    let year = alphaMatch[3];
    if (year.length === 2) year = '20' + year;
    const month = MONTH_MAP[monthName.slice(0, 3)] || '01';
    return `${year}-${month}-${day}`;
  }

  // 2. Format: Mon-YYYY or Mon YYYY (e.g. Nov 2026, 11/26)
  const monthYearAlpha = clean.match(/([A-Za-z]{3,9})[-/\s.](\d{2,4})/i);
  if (monthYearAlpha) {
    let monthName = monthYearAlpha[1].toLowerCase();
    let year = monthYearAlpha[2];
    if (year.length === 2) year = '20' + year;
    const month = MONTH_MAP[monthName.slice(0, 3)] || '01';
    return `${year}-${month}-28`;
  }

  // 3. Format: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const numMatch = clean.match(/(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{2,4})/);
  if (numMatch) {
    let p1 = parseInt(numMatch[1], 10);
    let p2 = parseInt(numMatch[2], 10);
    let year = numMatch[3];
    if (year.length === 2) year = '20' + year;

    // In India, standard grocery printing is DD/MM/YYYY
    let day = p1;
    let month = p2;
    if (p1 <= 12 && p2 > 12) {
      // MM/DD/YYYY format detected
      month = p1;
      day = p2;
    }

    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  }

  // 4. Format: MM/YYYY or MM-YY (e.g. 11/26)
  const mmYyMatch = clean.match(/(\d{1,2})[-/.](\d{2,4})/);
  if (mmYyMatch) {
    let month = parseInt(mmYyMatch[1], 10);
    let year = mmYyMatch[2];
    if (year.length === 2) year = '20' + year;
    if (month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}-28`;
    }
  }

  return null;
}

/**
 * Extracts Expiry Date, Mfg Date, MRP Price & Product Name from OCR raw text
 */
export function parseGroceryText(rawText) {
  if (!rawText) return { expiryDate: null, mfgDate: null, price: null, rawExpiryMatch: null };

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  let expiryDate = null;
  let rawExpiryMatch = null;
  let mfgDate = null;
  let price = null;

  // 1. Expiry / Best Before / Use By regex patterns
  const expPatterns = [
    /(?:exp(?:iry)?|use\s*by|best\s*before|valid\s*till|bb)[\s:.-]{0,5}(\d{1,2}[-./\s][A-Za-z0-9]{2,9}[-./\s]\d{2,4})/i,
    /(?:exp(?:iry)?|use\s*by|best\s*before|valid\s*till|bb)[\s:.-]{0,5}([A-Za-z]{3,9}[-./\s]\d{2,4})/i,
    /(?:exp(?:iry)?|use\s*by|best\s*before)[\s:.-]{0,5}(\d{1,2}[-./]\d{2,4})/i,
    /\b(exp|use\s*by)[\s:.-]{0,3}(\d{1,2}[-./]\d{1,2}[-./]\d{2,4})\b/i,
  ];

  for (const pattern of expPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const normalized = normalizeDateString(match[1]);
      if (normalized) {
        expiryDate = normalized;
        rawExpiryMatch = match[0];
        break;
      }
    }
  }

  // If no prefix found, find any standalone date after the word EXP or near the end
  if (!expiryDate) {
    const anyDatePattern = /\b(\d{1,2}[-/.](?:[A-Za-z]{3}|\d{1,2})[-/.]\d{2,4})\b/g;
    const allDates = [...fullText.matchAll(anyDatePattern)];
    if (allDates.length > 0) {
      // If two dates exist, typically first is Mfg and second is Expiry
      if (allDates.length >= 2) {
        mfgDate = normalizeDateString(allDates[0][1]);
        expiryDate = normalizeDateString(allDates[1][1]);
        rawExpiryMatch = allDates[1][1];
      } else {
        expiryDate = normalizeDateString(allDates[0][1]);
        rawExpiryMatch = allDates[0][1];
      }
    }
  }

  // 2. Manufacturing / Packaging Date patterns
  const mfgPatterns = [
    /(?:mfg|pkd|packed|pkg|mfr)[\s:.-]{0,5}(\d{1,2}[-./\s][A-Za-z0-9]{2,9}[-./\s]\d{2,4})/i,
    /(?:mfg|pkd|packed|pkg|mfr)[\s:.-]{0,5}([A-Za-z]{3,9}[-./\s]\d{2,4})/i,
  ];

  if (!mfgDate) {
    for (const pattern of mfgPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        mfgDate = normalizeDateString(match[1]);
        break;
      }
    }
  }

  // 3. Price / MRP pattern (e.g. MRP Rs. 45.00, Rs 30, ₹65)
  const priceMatch = fullText.match(/(?:mrp|rs\.?|inr|₹)[\s:.-]{0,3}(\d+(?:\.\d{1,2})?)/i);
  if (priceMatch && priceMatch[1]) {
    price = parseFloat(priceMatch[1]);
  }

  // 4. Common Grocery Name detection
  const commonNames = [
    'Milk', 'Paneer', 'Butter', 'Ghee', 'Curd', 'Dahi', 'Atta', 'Bread', 
    'Besan', 'Maida', 'Rice', 'Dal', 'Biscuits', 'Cheese', 'Cream', 
    'Yogurt', 'Tea', 'Coffee', 'Sugar', 'Salt', 'Oil', 'Ketchup', 'Jam',
    'Noodles', 'Pasta', 'Sauce', 'Eggs'
  ];

  let detectedName = null;
  for (const name of commonNames) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(fullText)) {
      detectedName = name;
      break;
    }
  }

  return {
    rawText,
    expiryDate,
    rawExpiryMatch,
    mfgDate,
    price,
    detectedName,
  };
}

let workerInstance = null;

/**
 * Perform high-accuracy client-side OCR on an image file, blob, or base64 URL
 */
export async function performGroceryOCR(imageSource, onProgress = () => {}) {
  try {
    if (!workerInstance) {
      workerInstance = await createWorker('eng');
    }

    const ret = await workerInstance.recognize(imageSource);
    const parsed = parseGroceryText(ret.data.text);
    return {
      ...parsed,
      confidence: ret.data.confidence,
    };
  } catch (err) {
    console.error('OCR failed:', err);
    throw new Error('Could not recognize text from image. Please enter manually.');
  }
}
