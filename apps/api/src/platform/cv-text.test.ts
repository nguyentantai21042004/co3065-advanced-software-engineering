import { describe, expect, it } from 'vitest';
import { cleanCvText, decodeUnicodeEscapesDeep, hasEnoughText } from './cv-text.js';

describe('cleanCvText', () => {
  it('strips control/PUA noise but keeps Vietnamese diacritics', () => {
    const dirty = 'Nguyễn\u0001Tấn\uE000Tài\n\n\n• Backend Engineer\npage 1\n42\n';
    const cleaned = cleanCvText(dirty);
    expect(cleaned).toContain('Nguyễn');
    expect(cleaned).toContain('Tấn');
    expect(cleaned).toContain('Tài');
    expect(cleaned).toContain('Backend Engineer');
    expect(cleaned).not.toMatch(/page 1/i);
    expect(cleaned.includes('\u0001')).toBe(false);
  });

  it('hasEnoughText gates short extracts', () => {
    expect(hasEnoughText('ngắn')).toBe(false);
    expect(hasEnoughText('A'.repeat(100))).toBe(true);
  });

  it('decodeUnicodeEscapesDeep restores literal \\u sequences', () => {
    const input = { city: 'TP. H\\u1ed3 Ch\\u00ed Minh' };
    const out = decodeUnicodeEscapesDeep(input);
    expect(out.city).toBe('TP. Hồ Chí Minh');
  });
});
