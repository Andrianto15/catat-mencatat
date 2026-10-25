import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Integration', () => {
  it('should have valid PWA manifest with required keys', () => {
    const manifestPath = path.join(process.cwd(), 'public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toBe('Catat-Mencatat');
    expect(manifest.short_name).toBe('Catat');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#4682b4');
    expect(manifest.background_color).toBe('#f8fafc');

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const icon192 = manifest.icons.find((i: any) => i.sizes === '192x192');
    const icon512 = manifest.icons.find((i: any) => i.sizes === '512x512');
    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
  });
});
