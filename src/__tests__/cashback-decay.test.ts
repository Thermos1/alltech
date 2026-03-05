import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

const { checkCashbackDecay } = await import('@/lib/cashback-decay');

function createAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { from: mockFrom } as any;
}

function mockProfile(bonus_balance: number, last_purchase_at: string | null) {
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { bonus_balance, last_purchase_at }, error: null }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  });
}

describe('checkCashbackDecay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not decay if last purchase was recent', async () => {
    const recent = new Date();
    recent.setMonth(recent.getMonth() - 1);
    mockProfile(500, recent.toISOString());

    const result = await checkCashbackDecay(createAdmin(), 'user-1');
    expect(result.decayed).toBe(false);
    expect(result.previousBalance).toBe(500);
  });

  it('decays balance after 3+ months', async () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 4);
    mockProfile(1000, old.toISOString());

    const result = await checkCashbackDecay(createAdmin(), 'user-1');
    expect(result.decayed).toBe(true);
    expect(result.previousBalance).toBe(1000);
    expect(result.monthsSinceLastPurchase).toBeGreaterThanOrEqual(3);
  });

  it('does not decay if balance is 0', async () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 6);
    mockProfile(0, old.toISOString());

    const result = await checkCashbackDecay(createAdmin(), 'user-1');
    expect(result.decayed).toBe(false);
  });

  it('does not decay if last_purchase_at is null', async () => {
    mockProfile(500, null);

    const result = await checkCashbackDecay(createAdmin(), 'user-1');
    expect(result.decayed).toBe(false);
  });

  it('does not decay if profile not found', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const result = await checkCashbackDecay(createAdmin(), 'nonexistent');
    expect(result.decayed).toBe(false);
  });
});
