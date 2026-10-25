import fs from 'fs';
import path from 'path';

describe('Project License', () => {
  it('has LICENSE file containing MIT license text and author', () => {
    const licensePath = path.resolve(__dirname, '../LICENSE');
    expect(fs.existsSync(licensePath)).toBe(true);

    const content = fs.readFileSync(licensePath, 'utf8');
    expect(content).toContain('MIT License');
    expect(content).toContain('2026 Andrianto Nur Iskandar');
  });

  it('specifies MIT license in package.json', () => {
    const pkgPath = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.license).toBe('MIT');
  });
});
