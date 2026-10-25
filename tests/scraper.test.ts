import fs from 'fs';
import path from 'path';
import { parseGaleri24Html } from '../src/lib/gold/scraper';

describe('Galeri24 Parser', () => {
  it('should parse brand, weight, sell_price, and buyback_price correctly', () => {
    const html = fs.readFileSync(
      path.join(__dirname, 'fixtures/galeri24-sample.html'),
      'utf8'
    );
    const result = parseGaleri24Html(html);
    expect(result.length).toBeGreaterThan(0);
    const antam1g = result.find(
      (r) => r.brand.toUpperCase() === 'ANTAM' && r.weight_gram === 1
    );
    expect(antam1g).toBeDefined();
    expect(antam1g?.sell_price).toBe(1450000);
    expect(antam1g?.buyback_price).toBe(1320000);
  });

  it('should return empty array gracefully on broken HTML', () => {
    expect(parseGaleri24Html('<div>broken</div>')).toEqual([]);
    expect(parseGaleri24Html('')).toEqual([]);
  });
});
