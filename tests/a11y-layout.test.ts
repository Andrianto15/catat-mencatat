import { viewport } from '../src/app/layout';

describe('Viewport & Layout Accessibility', () => {
  it('does not disable user scaling (WCAG 1.4.4 Resize Text)', () => {
    expect(viewport.userScalable).not.toBe(false);
    expect(viewport.maximumScale).toBeUndefined();
  });
});
