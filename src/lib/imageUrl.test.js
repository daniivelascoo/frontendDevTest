import { describe, expect, it } from 'vitest';
import { isSafeImageUrl, sanitizeImageUrl } from './imageUrl.js';

describe('isSafeImageUrl', () => {
  it('accepts the https URLs of the catalogue', () => {
    expect(
      isSafeImageUrl('https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg')
    ).toBe(true);
  });

  it('accepts http, which the browser already blocks as mixed content', () => {
    expect(isSafeImageUrl('http://ejemplo.test/imagen.jpg')).toBe(true);
  });

  it('accepts relative paths, which inherit the protocol of the page', () => {
    expect(isSafeImageUrl('/images/producto-1.jpg')).toBe(true);
    expect(isSafeImageUrl('images/producto-1.jpg')).toBe(true);
  });

  it('rejects the javascript scheme', () => {
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects the javascript scheme obfuscated with whitespace', () => {
    // The `URL` constructor strips internal tabs and line breaks, so both of
    // these forms resolve to `javascript:` all the same.
    expect(isSafeImageUrl('  javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('java\nscript:alert(1)')).toBe(false);
  });

  it('rejects data:, including the SVG flavour that can carry markup', () => {
    expect(isSafeImageUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
    expect(isSafeImageUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
  });

  it('rejects blob: and file:', () => {
    expect(isSafeImageUrl('blob:https://ejemplo.test/1234')).toBe(false);
    expect(isSafeImageUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects empty values and values that are not strings', () => {
    expect(isSafeImageUrl('')).toBe(false);
    expect(isSafeImageUrl('   ')).toBe(false);
    expect(isSafeImageUrl(null)).toBe(false);
    expect(isSafeImageUrl(undefined)).toBe(false);
    expect(isSafeImageUrl(42)).toBe(false);
  });
});

describe('sanitizeImageUrl', () => {
  it('returns the trimmed URL when it is usable', () => {
    expect(sanitizeImageUrl('  https://ejemplo.test/imagen.jpg  ')).toBe(
      'https://ejemplo.test/imagen.jpg'
    );
  });

  it('returns an empty string when it is not, so the caller uses its fallback', () => {
    expect(sanitizeImageUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeImageUrl('   ')).toBe('');
  });
});
