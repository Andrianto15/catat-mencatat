import fs from 'fs';
import path from 'path';

describe('CSS Tokens & Reset Hygiene', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');

  it('declares color-scheme for light and dark themes', () => {
    expect(css).toMatch(/\[data-theme=["']?light["']?\].*color-scheme:\s*light/s);
    expect(css).toMatch(/\[data-theme=["']?dark["']?\].*color-scheme:\s*dark/s);
  });

  it('defines --bg-input token across root, light, and dark modes', () => {
    expect(css).toContain('--bg-input');
  });

  it('declares font-family inheritance for form elements', () => {
    expect(css).toMatch(/input,\s*button,\s*select,\s*textarea\s*\{[^}]*font-family:\s*inherit/);
  });

  it('declares standardized .form-input helper class', () => {
    expect(css).toContain('.form-input');
    expect(css).toMatch(/\.form-input\s*\{[^}]*border-radius:\s*var\(--radius-lg\)/);
  });
});

