import fs from 'fs';
import path from 'path';

describe('Gold Price Edit Form Spacing', () => {
  const pricesPage = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/prices/page.tsx'), 'utf-8');

  it('ensures labels for Harga Jual and Harga Buyback have vertical spacing marginBottom from input boxes', () => {
    const sellLabelMatch = pricesPage.match(/<label[^>]*>[\s\S]*?Harga Jual \(Rp\)[\s\S]*?<\/label>/);
    const buybackLabelMatch = pricesPage.match(/<label[^>]*>[\s\S]*?Harga Buyback \(Rp\)[\s\S]*?<\/label>/);

    expect(sellLabelMatch).toBeTruthy();
    expect(buybackLabelMatch).toBeTruthy();

    expect(sellLabelMatch![0]).toContain('marginBottom');
    expect(sellLabelMatch![0]).toContain('0.375rem');

    expect(buybackLabelMatch![0]).toContain('marginBottom');
    expect(buybackLabelMatch![0]).toContain('0.375rem');
  });
});

