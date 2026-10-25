import fs from 'fs';
import path from 'path';

describe('Design Documentation Sync', () => {
  const designDoc = fs.readFileSync(path.resolve(__dirname, '../DESIGN.md'), 'utf-8');

  it('describes Catat-Mencatat application domain', () => {
    expect(designDoc).toContain('Catat-Mencatat');
    expect(designDoc).not.toContain('Andesa PDF Utility');
    expect(designDoc).toContain('Servis Motor');
    expect(designDoc).toContain('Emas Fisik');
    expect(designDoc).toContain('Zakat Mal');
  });

  it('documents current design system tokens and mobile ergonomics', () => {
    expect(designDoc).toContain('#4682b4'); // steel blue
    expect(designDoc).toContain('44px'); // minimum touch target
    expect(designDoc).toContain('--color-danger-bg');
  });
});
