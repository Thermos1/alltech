import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track all calls to profile updates and referral_events inserts
const profileUpdates: Array<{ id: string; bonus_balance: number }> = [];
const referralInserts: Array<Record<string, unknown>> = [];
let mockProfileData: Record<string, unknown> = {};
let mockReferrerData: Record<string, unknown> | null = null;
let mockReferralCount = 0;

const mockFrom = vi.fn();
const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import('@/app/api/payment/webhook/route');

function createWebhookRequest(orderId: string, total: string) {
  return new Request('http://localhost/api/payment/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'payment.succeeded',
      object: {
        id: 'pay-ref-test',
        status: 'succeeded',
        amount: { value: total, currency: 'RUB' },
        metadata: { order_id: orderId, order_number: 'ALT-2026-REF1' },
      },
    }),
  });
}

function setupReferralMocks(opts: {
  orderTotal: number;
  referredBy: string | null;
  referrerBalance: number;
  existingReferralCount: number;
}) {
  profileUpdates.length = 0;
  referralInserts.length = 0;
  mockProfileData = {
    id: 'buyer1',
    bonus_balance: 0,
    referred_by: opts.referredBy,
    total_spent: 0,
    manager_id: null,
  };
  mockReferrerData = opts.referredBy
    ? { id: opts.referredBy, bonus_balance: opts.referrerBalance }
    : null;
  mockReferralCount = opts.existingReferralCount;

  let orderSelectCount = 0;

  mockFrom.mockImplementation((table: string) => {
    if (table === 'orders') {
      if (orderSelectCount === 0) {
        orderSelectCount++;
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: 'order-ref1',
                    order_number: 'ALT-2026-REF1',
                    yookassa_payment_id: 'pay-ref-test',
                    payment_status: 'pending',
                    total: opts.orderTotal,
                    subtotal: opts.orderTotal,
                    bonus_used: 0,
                    discount_amount: 0,
                    promo_code_id: null,
                    user_id: 'buyer1',
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    }

    if (table === 'profiles') {
      return {
        select: (fields: string) => ({
          eq: (_col: string, val: string) => ({
            single: () => {
              if (val === 'buyer1') {
                return Promise.resolve({ data: mockProfileData, error: null });
              }
              if (val === opts.referredBy) {
                return Promise.resolve({
                  data: fields.includes('bonus_balance')
                    ? mockReferrerData
                    : mockReferrerData,
                  error: null,
                });
              }
              return Promise.resolve({ data: null, error: null });
            },
          }),
        }),
        update: (data: Record<string, unknown>) => ({
          eq: (_col: string, val: string) => {
            profileUpdates.push({
              id: val,
              bonus_balance: data.bonus_balance as number,
            });
            return Promise.resolve({ error: null });
          },
        }),
      };
    }

    if (table === 'referral_events') {
      return {
        select: (_fields: string, opts2: Record<string, unknown>) => ({
          eq: () => {
            if (opts2?.count === 'exact') {
              return Promise.resolve({
                count: mockReferralCount,
                data: null,
                error: null,
              });
            }
            return Promise.resolve({ data: [], error: null });
          },
        }),
        insert: (data: Record<string, unknown>) => {
          referralInserts.push(data);
          return Promise.resolve({ error: null });
        },
      };
    }

    if (table === 'order_items') {
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }

    if (table === 'commission_log') {
      return {
        insert: () => Promise.resolve({ error: null }),
      };
    }

    // Default
    return {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      insert: () => Promise.resolve({ error: null }),
    };
  });
}

describe('Referral bonus logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('awards 500₽ + 1% on first purchase via referral', async () => {
    setupReferralMocks({
      orderTotal: 10000,
      referredBy: 'referrer1',
      referrerBalance: 200,
      existingReferralCount: 0,
    });

    const req = createWebhookRequest('order-ref1', '10000.00');
    const res = await POST(req as never);
    expect(res.status).toBe(200);

    // 500₽ first-purchase bonus + 1% of 10000 = 100 → total 600
    const referrerUpdate = profileUpdates.find((u) => u.id === 'referrer1');
    expect(referrerUpdate).toBeDefined();
    expect(referrerUpdate!.bonus_balance).toBe(200 + 500 + 100); // 800

    // Referral event recorded
    expect(referralInserts).toHaveLength(1);
    expect(referralInserts[0].bonus_awarded).toBe(600);
    expect(referralInserts[0].referrer_id).toBe('referrer1');
    expect(referralInserts[0].referred_id).toBe('buyer1');
  });

  it('awards only 1% on repeat purchase (no 500₽)', async () => {
    setupReferralMocks({
      orderTotal: 5000,
      referredBy: 'referrer1',
      referrerBalance: 1000,
      existingReferralCount: 1, // Already has previous referral event
    });

    const req = createWebhookRequest('order-ref1', '5000.00');
    const res = await POST(req as never);
    expect(res.status).toBe(200);

    // 1% of 5000 = 50, no first-purchase bonus
    const referrerUpdate = profileUpdates.find((u) => u.id === 'referrer1');
    expect(referrerUpdate).toBeDefined();
    expect(referrerUpdate!.bonus_balance).toBe(1000 + 50); // 1050

    expect(referralInserts).toHaveLength(1);
    expect(referralInserts[0].bonus_awarded).toBe(50);
  });

  it('does not award referral bonus without referred_by', async () => {
    setupReferralMocks({
      orderTotal: 10000,
      referredBy: null,
      referrerBalance: 0,
      existingReferralCount: 0,
    });

    const req = createWebhookRequest('order-ref1', '10000.00');
    const res = await POST(req as never);
    expect(res.status).toBe(200);

    // No referral updates
    const referrerUpdate = profileUpdates.find((u) => u.id !== 'buyer1');
    expect(referrerUpdate).toBeUndefined();
    expect(referralInserts).toHaveLength(0);
  });

  it('calculates 1% correctly for various amounts', async () => {
    // 1% of 4800 = 48
    setupReferralMocks({
      orderTotal: 4800,
      referredBy: 'referrer1',
      referrerBalance: 0,
      existingReferralCount: 2,
    });

    const req = createWebhookRequest('order-ref1', '4800.00');
    const res = await POST(req as never);
    expect(res.status).toBe(200);

    const referrerUpdate = profileUpdates.find((u) => u.id === 'referrer1');
    expect(referrerUpdate).toBeDefined();
    expect(referrerUpdate!.bonus_balance).toBe(0 + 48); // 1% of 4800

    expect(referralInserts[0].bonus_awarded).toBe(48);
  });

  it('floors the 1% bonus (no fractional bonuses)', async () => {
    // 1% of 999 = 9.99 → floor → 9
    setupReferralMocks({
      orderTotal: 999,
      referredBy: 'referrer1',
      referrerBalance: 500,
      existingReferralCount: 3,
    });

    const req = createWebhookRequest('order-ref1', '999.00');
    const res = await POST(req as never);
    expect(res.status).toBe(200);

    const referrerUpdate = profileUpdates.find((u) => u.id === 'referrer1');
    expect(referrerUpdate!.bonus_balance).toBe(500 + 9); // floor(999 * 0.01) = 9

    expect(referralInserts[0].bonus_awarded).toBe(9);
  });
});
