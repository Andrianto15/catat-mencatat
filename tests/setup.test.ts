import fs from 'fs';
import path from 'path';

describe('Project Environment & Node 26 Config', () => {
  it('should run Jest unit tests correctly', () => {
    expect(true).toBe(true);
  });

  it('should configure Node 26 in .nvmrc and package.json engines', () => {
    const nvmrcPath = path.join(process.cwd(), '.nvmrc');
    expect(fs.existsSync(nvmrcPath)).toBe(true);
    expect(fs.readFileSync(nvmrcPath, 'utf8').trim()).toMatch(/^26/);

    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.engines?.node).toBe('>=26.0.0');
    expect(pkg.devDependencies['@types/node']).toMatch(/^\^?26\./);
  });
});
