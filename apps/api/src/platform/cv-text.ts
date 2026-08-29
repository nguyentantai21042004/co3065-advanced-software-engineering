/**
 * ATS-inspired CV text hygiene (from ahamove/applicant-tracking-system cv-parser.service).
 * Content-preserving: keeps Vietnamese diacritics (NFC); strips PDF noise before LLM/stub.
 */

/** Minimum useful extracted character count (after clean). */
export const MIN_USEFUL_CV_CHARS = 80;

/**
 * cleanCvText strips Private Use Area glyphs, control chars, decorative bullets,
 * page-number boilerplate, and collapses excess blank lines.
 */
export function cleanCvText(text: string): string {
  if (!text) return '';
  let out = text.normalize('NFC');
  out = out.replace(/[\uE000-\uF8FF\uFFFD\u25A1]/g, '');
  // Keep tab/newline; drop other C0 controls.
  // eslint-disable-next-line no-control-regex
  out = out.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  out = out.replace(/\r\n?/g, '\n');
  out = out
    .split('\n')
    .map((line) => {
      const collapsed = line.replace(/[ \t]+/g, ' ').trimEnd();
      return collapsed.replace(/^\s*(?:[•●▪◦‣·∙*▸▹‒–—]|[-*])\s+/, '');
    })
    .join('\n');
  out = out.replace(/^\s*(?:page|trang)\s+\d+(?:\s*(?:of|\/)\s*\d+)?\s*$/gim, '');
  out = out.replace(/^\s*\d{1,3}\s*$/gm, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

/** hasEnoughText mirrors ATS gate: enough signal to trust extract. */
export function hasEnoughText(text: string, min = MIN_USEFUL_CV_CHARS): boolean {
  return cleanCvText(text).replace(/\s+/g, '').length >= min;
}

/**
 * decodeUnicodeEscapesDeep turns literal \uXXXX sequences the model sometimes
 * leaves inside JSON strings back into real characters (VN diacritics).
 */
export function decodeUnicodeEscapesDeep<T>(value: T): T {
  const re = /\\+u([0-9a-fA-F]{4})/g;
  if (typeof value === 'string') {
    let out: string = value;
    for (let i = 0; i < 3 && re.test(out); i++) {
      out = out.replace(re, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)));
    }
    return out as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => decodeUnicodeEscapesDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = decodeUnicodeEscapesDeep(v);
    }
    return out as T;
  }
  return value;
}
