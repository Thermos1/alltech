import { describe, it, expect } from 'vitest';
import { getBonusTier, getNextTier, BONUS_TIERS } from '@/lib/constants';

describe('BONUS_TIERS', () => {
  it('has 4 tiers', () => {
    expect(BONUS_TIERS).toHaveLength(4);
  });

  it('tiers cover full range without gaps', () => {
    for (let i = 1; i < BONUS_TIERS.length; i++) {
      expect(BONUS_TIERS[i].min).toBe(BONUS_TIERS[i - 1].max + 1);
    }
  });

  it('last tier has Infinity max', () => {
    expect(BONUS_TIERS[BONUS_TIERS.length - 1].max).toBe(Infinity);
  });

  it('percentages increase with each tier', () => {
    for (let i = 1; i < BONUS_TIERS.length; i++) {
      expect(BONUS_TIERS[i].percent).toBeGreaterThan(BONUS_TIERS[i - 1].percent);
    }
  });
});

describe('getBonusTier', () => {
  it('returns Старт for 0', () => {
    expect(getBonusTier(0).name).toBe('Старт');
    expect(getBonusTier(0).percent).toBe(2);
  });

  it('returns Старт for 499_999', () => {
    expect(getBonusTier(499_999).name).toBe('Старт');
  });

  it('returns Серебро for 500_000', () => {
    expect(getBonusTier(500_000).name).toBe('Серебро');
    expect(getBonusTier(500_000).percent).toBe(3);
  });

  it('returns Золото for 700_000', () => {
    expect(getBonusTier(700_000).name).toBe('Золото');
    expect(getBonusTier(700_000).percent).toBe(5);
  });

  it('returns Платина for 1_000_000', () => {
    expect(getBonusTier(1_000_000).name).toBe('Платина');
    expect(getBonusTier(1_000_000).percent).toBe(7);
  });

  it('returns Платина for very large amounts', () => {
    expect(getBonusTier(99_999_999).name).toBe('Платина');
  });

  it('returns Старт for negative (fallback)', () => {
    expect(getBonusTier(-1).name).toBe('Старт');
  });
});

describe('getNextTier', () => {
  it('returns Серебро when at Старт', () => {
    const next = getNextTier(0);
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Серебро');
  });

  it('returns Золото when at Серебро', () => {
    const next = getNextTier(550_000);
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Золото');
  });

  it('returns Платина when at Золото', () => {
    const next = getNextTier(800_000);
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Платина');
  });

  it('returns null when at Платина (max tier)', () => {
    expect(getNextTier(2_000_000)).toBeNull();
  });

  it('returns correct tier at boundary', () => {
    const next = getNextTier(499_999);
    expect(next!.name).toBe('Серебро');
    expect(next!.min).toBe(500_000);
  });
});
