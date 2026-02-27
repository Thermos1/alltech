import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatPriceShort,
  cn,
  generateOrderNumber,
  pluralize,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price in Russian ruble currency', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  it('formats zero price', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('rounds to whole numbers', () => {
    const result = formatPrice(1999.99);
    expect(result).toContain('2');
    expect(result).toContain('000');
  });
});

describe('formatPriceShort', () => {
  it('formats price with ruble sign', () => {
    expect(formatPriceShort(1500)).toBe('1\u00a0500 ₽');
  });

  it('formats zero', () => {
    expect(formatPriceShort(0)).toBe('0 ₽');
  });

  it('formats large numbers with separators', () => {
    const result = formatPriceShort(150000);
    expect(result).toContain('150');
    expect(result).toContain('000');
    expect(result).toContain('₽');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, 'b', undefined, null, 'c')).toBe('a b c');
  });

  it('returns empty string for no truthy values', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});

describe('generateOrderNumber', () => {
  it('starts with ALT-', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^ALT-/);
  });

  it('contains current year', () => {
    const year = new Date().getFullYear();
    const num = generateOrderNumber();
    expect(num).toContain(year.toString());
  });

  it('matches format ALT-YYYY-XXXX', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^ALT-\d{4}-\d{4}$/);
  });

  it('generates unique numbers', () => {
    const numbers = new Set(
      Array.from({ length: 100 }, () => generateOrderNumber())
    );
    // With 10000 possible values and 100 samples, collisions are very unlikely
    expect(numbers.size).toBeGreaterThan(90);
  });
});

describe('pluralize', () => {
  it('returns "one" form for 1', () => {
    expect(pluralize(1, 'товар', 'товара', 'товаров')).toBe('товар');
  });

  it('returns "few" form for 2-4', () => {
    expect(pluralize(2, 'товар', 'товара', 'товаров')).toBe('товара');
    expect(pluralize(3, 'товар', 'товара', 'товаров')).toBe('товара');
    expect(pluralize(4, 'товар', 'товара', 'товаров')).toBe('товара');
  });

  it('returns "many" form for 5-20', () => {
    expect(pluralize(5, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(11, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(19, 'товар', 'товара', 'товаров')).toBe('товаров');
  });

  it('handles teens (11-14) correctly', () => {
    expect(pluralize(11, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(12, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(13, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(14, 'товар', 'товара', 'товаров')).toBe('товаров');
  });

  it('handles 21, 22, etc.', () => {
    expect(pluralize(21, 'товар', 'товара', 'товаров')).toBe('товар');
    expect(pluralize(22, 'товар', 'товара', 'товаров')).toBe('товара');
    expect(pluralize(25, 'товар', 'товара', 'товаров')).toBe('товаров');
  });

  it('handles zero', () => {
    expect(pluralize(0, 'товар', 'товара', 'товаров')).toBe('товаров');
  });

  it('handles 100+', () => {
    expect(pluralize(100, 'товар', 'товара', 'товаров')).toBe('товаров');
    expect(pluralize(101, 'товар', 'товара', 'товаров')).toBe('товар');
    expect(pluralize(111, 'товар', 'товара', 'товаров')).toBe('товаров');
  });
});
