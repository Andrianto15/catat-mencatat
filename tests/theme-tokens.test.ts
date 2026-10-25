import fs from 'fs';
import path from 'path';

describe('Semantic Theme Tokens', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');

  it('defines semantic danger and success tokens across light and dark modes', () => {
    expect(css).toContain('--color-danger-bg');
    expect(css).toContain('--color-danger-text');
    expect(css).toContain('--color-success-bg');
    expect(css).toContain('--color-success-text');
  });
});
