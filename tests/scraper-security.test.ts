import { parseGaleri24Html } from '../src/lib/gold/scraper';

describe('Gold Scraper Security & Fallback Integrity', () => {
  it('should parse malformed unclosed tags in linear time without catastrophic backtracking', () => {
    // Generate repeated unclosed vendor tags designed to cause backtracking in nested regex
    const maliciousHtml = '<div class="vendor '.repeat(500) + 'ANTAM' + '</div>'.repeat(500);
    const start = Date.now();
    const result = parseGaleri24Html(maliciousHtml);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should still correctly extract vendor brand headings from standard HTML', () => {
    const html = `
      <div class="vendor-card">ANTAM</div>
      <table>
        <tbody>
          <tr>
            <td>1 gr</td>
            <td>1.500.000</td>
            <td>1.350.000</td>
          </tr>
        </tbody>
      </table>
    `;
    const result = parseGaleri24Html(html);
    expect(result.length).toBe(1);
    expect(result[0].brand).toBe('ANTAM');
    expect(result[0].weight_gram).toBe(1);
    expect(result[0].sell_price).toBe(1500000);
    expect(result[0].buyback_price).toBe(1350000);
  });

  it('should correctly prioritize non-null buyback prices across chronological rows', () => {
    // Simulate what src/app/emas/page.tsx does when mapping buyback prices:
    // Today's failed row has buyback_price: null, yesterday's valid row has buyback_price: 1350000
    const pricesData = [
      {
        price_date: '2026-11-01',
        brand: 'ANTAM',
        weight_gram: 1,
        sell_price: null,
        buyback_price: null,
        status: 'gagal',
      },
      {
        price_date: '2026-10-31',
        brand: 'ANTAM',
        weight_gram: 1,
        sell_price: 1500000,
        buyback_price: 1350000,
        status: 'auto',
      },
    ];

    const map: Record<string, number | null> = {};
    for (const p of pricesData) {
      const key = `${p.brand.toUpperCase()}-${p.weight_gram}`;
      if (map[key] === undefined && p.buyback_price !== null && p.buyback_price !== undefined) {
        map[key] = p.buyback_price;
      }
    }

    expect(map['ANTAM-1']).toBe(1350000);
  });
});
