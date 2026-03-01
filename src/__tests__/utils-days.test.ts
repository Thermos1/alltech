import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { daysFromNow } from '@/lib/utils';

describe('daysFromNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns positive number for future date', () => {
    const future = new Date('2026-03-11T12:00:00Z');
    expect(daysFromNow(future)).toBe(10);
  });

  it('returns negative number for past date', () => {
    const past = new Date('2026-02-19T12:00:00Z');
    expect(daysFromNow(past)).toBe(-10);
  });

  it('returns 0 for today', () => {
    const today = new Date('2026-03-01T12:00:00Z');
    expect(daysFromNow(today)).toBe(0);
  });

  it('returns correct value for exactly 30 days from now', () => {
    const thirtyDays = new Date('2026-03-31T12:00:00Z');
    expect(daysFromNow(thirtyDays)).toBe(30);
  });

  it('returns correct value for yesterday (-1)', () => {
    const yesterday = new Date('2026-02-28T12:00:00Z');
    expect(daysFromNow(yesterday)).toBe(-1);
  });

  it('handles date far in the future (365 days)', () => {
    const farFuture = new Date('2027-03-01T12:00:00Z');
    expect(daysFromNow(farFuture)).toBe(365);
  });
});
