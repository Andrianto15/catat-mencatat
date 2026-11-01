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

  it('should parse 3-column table format with vendor headers correctly', () => {
    const html = fs.readFileSync(
      path.join(__dirname, 'fixtures/galeri24-3col-sample.html'),
      'utf8'
    );
    const result = parseGaleri24Html(html);
    expect(result.length).toBe(6);

    const g24_1g = result.find(
      (r) => r.brand.toUpperCase() === 'GALERI 24' && r.weight_gram === 1
    );
    expect(g24_1g).toBeDefined();
    expect(g24_1g?.sell_price).toBe(1460000);
    expect(g24_1g?.buyback_price).toBe(1330000);

    const antam10g = result.find(
      (r) => r.brand.toUpperCase() === 'ANTAM' && r.weight_gram === 10
    );
    expect(antam10g).toBeDefined();
    expect(antam10g?.sell_price).toBe(14100000);
    expect(antam10g?.buyback_price).toBe(13350000);

    const ubs1g = result.find(
      (r) => r.brand.toUpperCase() === 'UBS' && r.weight_gram === 1
    );
    expect(ubs1g).toBeDefined();
    expect(ubs1g?.sell_price).toBe(1430000);
    expect(ubs1g?.buyback_price).toBe(1310000);
  });

  it('should parse Nuxt 3 dehydrated state from live Galeri24 HTML script tag', () => {
    const nuxtHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>Galeri 24</title></head>
      <body>
        <div id="__nuxt"></div>
        <script>[
          ["Reactive",1],
          {"data":2},
          {"goldPrice":3},
          [4],
          {"vendorName":5,"denomination":6,"sellingPrice":7,"buybackPrice":8},
          "ANTAM",
          "1",
          "2585000",
          "2312000"
        ]</script>
      </body>
      </html>
    `;
    const result = parseGaleri24Html(nuxtHtml);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      brand: 'ANTAM',
      weight_gram: 1,
      sell_price: 2585000,
      buyback_price: 2312000,
    });
  });
});
