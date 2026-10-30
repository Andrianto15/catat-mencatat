export interface ParsedGoldPrice {
  brand: string;
  weight_gram: number;
  sell_price: number | null;
  buyback_price: number | null;
}

export function parsePriceNumber(raw: string): number | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const val = parseInt(digits, 10);
  return isNaN(val) ? null : val;
}

export function parseWeightGram(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/gr|gram/, '').trim().replace(',', '.');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

export function cleanBrandName(raw: string): string {
  if (!raw) return '';
  const stripped = raw
    .replace(/<[^>]+>/g, '')
    .toUpperCase()
    .replace(/\b(HARGA|EMAS|BATANGAN|LOGAM|MULIA|GOLD)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped === 'GALERI 24' || stripped === 'GALERI24') {
    return 'GALERI 24';
  }
  if (stripped === 'ANTAM') {
    return 'ANTAM';
  }
  if (stripped === 'UBS') {
    return 'UBS';
  }
  return stripped;
}

export function parseNuxtPayload(html: string): ParsedGoldPrice[] {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (!content.includes('goldPrice')) continue;
    try {
      const pool = JSON.parse(content);
      if (!Array.isArray(pool)) continue;

      let itemsList: any[] | null = null;
      for (const entry of pool) {
        if (entry && typeof entry === 'object' && !Array.isArray(entry) && 'goldPrice' in entry) {
          const goldPriceIdx = entry.goldPrice;
          if (Array.isArray(pool[goldPriceIdx])) {
            itemsList = pool[goldPriceIdx];
            break;
          }
        }
      }

      if (!itemsList) continue;

      const resolveVal = (val: any) => {
        if (typeof val === 'number' && pool[val] !== undefined) {
          return pool[val];
        }
        return val;
      };

      const results: ParsedGoldPrice[] = [];
      for (const itemIdx of itemsList) {
        const raw = pool[itemIdx];
        if (!raw || typeof raw !== 'object') continue;

        const brandRaw = resolveVal(raw.vendorName);
        const weightRaw = resolveVal(raw.denomination);
        const sellRaw = resolveVal(raw.sellingPrice);
        const buybackRaw = resolveVal(raw.buybackPrice);

        const brand = cleanBrandName(String(brandRaw || ''));
        const weight_gram =
          typeof weightRaw === 'number' ? weightRaw : parseFloat(String(weightRaw));
        const sell_price = parsePriceNumber(String(sellRaw));
        const buyback_price = parsePriceNumber(String(buybackRaw));

        if (brand && !isNaN(weight_gram) && weight_gram > 0) {
          results.push({
            brand,
            weight_gram,
            sell_price,
            buyback_price,
          });
        }
      }

      if (results.length > 0) {
        return results;
      }
    } catch {
      // Continue searching next script tag
    }
  }
  return [];
}

function parseRows(containerHtml: string, defaultBrand: string, results: ParsedGoldPrice[]) {
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(containerHtml)) !== null) {
    const rowHtml = trMatch[1];
    if (rowHtml.includes('<th')) {
      continue;
    }

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let tdMatch;

    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length >= 4) {
      const brand = cleanBrandName(cells[0]) || cells[0].trim().toUpperCase();
      const weight_gram = parseWeightGram(cells[1]);
      const sell_price = parsePriceNumber(cells[2]);
      const buyback_price = parsePriceNumber(cells[3]);

      if (brand && weight_gram !== null && weight_gram > 0) {
        results.push({ brand, weight_gram, sell_price, buyback_price });
      }
    } else if (cells.length === 3) {
      const weight_gram = parseWeightGram(cells[0]);
      const sell_price = parsePriceNumber(cells[1]);
      const buyback_price = parsePriceNumber(cells[2]);
      const brand = defaultBrand || 'GALERI 24';

      if (brand && weight_gram !== null && weight_gram > 0) {
        results.push({ brand, weight_gram, sell_price, buyback_price });
      }
    }
  }
}

export function parseGaleri24Html(html: string): ParsedGoldPrice[] {
  if (!html || typeof html !== 'string') return [];

  const nuxtPrices = parseNuxtPayload(html);
  if (nuxtPrices.length > 0) {
    return nuxtPrices;
  }

  const results: ParsedGoldPrice[] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;
  let lastIndex = 0;
  let foundTables = false;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    foundTables = true;
    const tableHtml = tableMatch[1];
    const preText = html.slice(lastIndex, tableMatch.index);
    lastIndex = tableMatch.index + tableMatch[0].length;

    let tableBrand = '';
    const headingRegex =
      /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<[^>]+class="[^"]*(?:vendor|title|brand)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi;
    let headingMatch;
    while ((headingMatch = headingRegex.exec(preText)) !== null) {
      const headingText = headingMatch[1] || headingMatch[2] || '';
      const candidate = cleanBrandName(headingText);
      if (candidate) tableBrand = candidate;
    }

    parseRows(tableHtml, tableBrand, results);
  }

  if (!foundTables) {
    parseRows(html, '', results);
  }

  return results;
}

export async function fetchLiveGaleri24Prices(): Promise<ParsedGoldPrice[]> {
  const url = process.env.GALERI24_URL || 'https://galeri24.co.id/harga-emas';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Galeri24: HTTP ${res.status}`);
    }

    const html = await res.text();
    return parseGaleri24Html(html);
  } catch (error) {
    console.error('Error fetching Galeri24 gold prices:', error);
    return [];
  }
}
