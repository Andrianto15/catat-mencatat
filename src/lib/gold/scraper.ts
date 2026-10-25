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

export function parseGaleri24Html(html: string): ParsedGoldPrice[] {
  if (!html || typeof html !== 'string') return [];

  const results: ParsedGoldPrice[] = [];

  // Match <tr> elements inside table
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowHtml = trMatch[1];
    if (rowHtml.includes('<th')) {
      continue; // Skip header row
    }

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let tdMatch;

    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      // Strip inner HTML tags
      const text = tdMatch[1].replace(/<[^>]+>/g, '').trim();
      cells.push(text);
    }

    if (cells.length >= 4) {
      const brand = cells[0].trim().toUpperCase();
      const weight_gram = parseWeightGram(cells[1]);
      const sell_price = parsePriceNumber(cells[2]);
      const buyback_price = parsePriceNumber(cells[3]);

      if (brand && weight_gram !== null && weight_gram > 0) {
        results.push({
          brand,
          weight_gram,
          sell_price,
          buyback_price,
        });
      }
    }
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
