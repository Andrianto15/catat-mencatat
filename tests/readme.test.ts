import fs from 'fs';
import path from 'path';

describe('Project README.md', () => {
  const readmePath = path.resolve(__dirname, '../README.md');

  it('verifies README.md exists at project root', () => {
    expect(fs.existsSync(readmePath)).toBe(true);
  });

  it('includes project header and logo reference', () => {
    const content = fs.readFileSync(readmePath, 'utf8');
    expect(content).toContain('logo.svg');
    expect(content).toContain('Catat-Mencatat');
  });

  it('documents environment, installation, development, and test commands', () => {
    const content = fs.readFileSync(readmePath, 'utf8');
    expect(content).toContain('.env.example');
    expect(content).toContain('npm install');
    expect(content).toContain('npm run dev');
    expect(content).toContain('npm test');
    expect(content).toContain('/api/cron/motor-reminder');
  });

  it('references PRD and design guidelines without duplicating them', () => {
    const content = fs.readFileSync(readmePath, 'utf8');
    expect(content).toContain('PRD.md');
    expect(content).toContain('DESIGN.md');
  });

  it('does not contain redundant standalone sections prohibited by guidelines', () => {
    const content = fs.readFileSync(readmePath, 'utf8');
    expect(content).not.toMatch(/^##\s+LICENSE/im);
    expect(content).not.toMatch(/^##\s+CONTRIBUTING/im);
    expect(content).not.toMatch(/^##\s+CHANGELOG/im);
  });
});

