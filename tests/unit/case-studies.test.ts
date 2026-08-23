import { describe, expect, it } from 'vitest';
import { getCaseStudies } from '../../src/lib/case-studies';

describe('case study publication gate', () => {
  it('anonymizes names and claims until publication is approved', () => {
    const cases = getCaseStudies(false);
    const serialized = JSON.stringify(cases);

    expect(serialized).not.toContain('Mirta Libera');
    expect(serialized).not.toContain('María Laumann');
    expect(cases.every((entry) => entry.label.includes('en revisión'))).toBe(true);
  });

  it('exposes the supplied client identities only after explicit approval', () => {
    const cases = getCaseStudies(true);

    expect(cases[0].name).toBe('Mirta Libera Propiedades');
    expect(cases[1].name).toBe('María Laumann Asociados');
    expect(cases.every((entry) => entry.label.includes('aprobado'))).toBe(true);
  });
});
