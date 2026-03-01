import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slugify';

describe('slugify', () => {
  it('transliterates cyrillic to latin', () => {
    expect(slugify('Привет мир')).toBe('privet-mir');
  });

  it('handles product name with latin and numbers', () => {
    expect(slugify('ROLF GT SAE 5W-40')).toBe('rolf-gt-sae-5w-40');
  });

  it('handles mixed cyrillic and latin', () => {
    expect(slugify('Масло ROLF 5W-30')).toBe('maslo-rolf-5w-30');
  });

  it('removes special characters', () => {
    expect(slugify('Масло (синтетика) / 100%')).toBe('maslo-sintetika-100');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('  --Тест--  ')).toBe('test');
  });

  it('collapses multiple dashes', () => {
    expect(slugify('один   два   три')).toBe('odin-dva-tri');
  });

  it('handles ё correctly', () => {
    expect(slugify('ёлка')).toBe('yolka');
  });

  it('handles щ correctly', () => {
    expect(slugify('щётка')).toBe('shchyotka');
  });

  it('handles ъ and ь (silent letters)', () => {
    expect(slugify('объект')).toBe('obekt');
    expect(slugify('соль')).toBe('sol');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('truncates to 120 characters max', () => {
    const longName = 'а'.repeat(200);
    expect(slugify(longName).length).toBeLessThanOrEqual(120);
  });

  it('handles real product names', () => {
    expect(slugify('KIXX G1 5W-40 SN/CF')).toBe('kixx-g1-5w-40-sn-cf');
    expect(slugify('Sintec Platinum SAE 5W-30 API SL/CF')).toBe('sintec-platinum-sae-5w-30-api-sl-cf');
    expect(slugify('ROLF Krafton P5 U 10W-40')).toBe('rolf-krafton-p5-u-10w-40');
  });

  it('handles numbers only', () => {
    expect(slugify('12345')).toBe('12345');
  });

  it('handles unicode beyond cyrillic', () => {
    // non-cyrillic, non-latin chars get replaced with dashes
    expect(slugify('масло 日本')).toBe('maslo');
  });
});
