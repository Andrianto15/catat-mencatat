import fs from 'fs';
import path from 'path';

describe('Responsive Touch Targets & Mobile Reflow', () => {
  const zakatPage = fs.readFileSync(path.resolve(__dirname, '../src/app/zakat/page.tsx'), 'utf-8');
  const motorPage = fs.readFileSync(path.resolve(__dirname, '../src/app/motor/page.tsx'), 'utf-8');

  it('zakat person selector pills have minimum 44px touch height', () => {
    // Must be minHeight 44px, not 38px
    expect(zakatPage).toContain("minHeight: '44px'");
    expect(zakatPage).not.toContain("minHeight: '38px'");
  });

  it('motor stats card grid handles responsive auto-fit reflow on mobile', () => {
    expect(motorPage).toMatch(/repeat\(auto-fit,\s*minmax/);
  });
});
