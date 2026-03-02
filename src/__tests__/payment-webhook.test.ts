import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin client
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks
const { POST } = await import('@/app/api/payment/webhook/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/payment/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/payment/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing orderId', async () => {
    const req = createRequest({ paymentId: 'p1' });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing paymentId', async () => {
    const req = createRequest({ orderId: 'o1' });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('returns 404 when order not found', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    expect(res.status).toBe(404);
  });

  it('returns 400 for payment mismatch', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: {
              id: 'o1',
              order_number: 'ALT-2026-0001',
              yookassa_payment_id: 'different-payment',
              payment_status: 'pending',
              total: 5000,
              user_id: 'u1',
            },
            error: null,
          }),
        }),
      }),
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('processes successful payment', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders' && callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'o1',
                  order_number: 'ALT-2026-0001',
                  yookassa_payment_id: 'p1',
                  payment_status: 'pending',
                  total: 5000,
                  user_id: 'u1',
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: 'u1', bonus_balance: 100, referred_by: null },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === 'referral_events') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ count: 0 }),
          }),
        };
      }
      return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      };
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderNumber).toBe('ALT-2026-0001');
    expect(data.status).toBe('paid');
  });

  it('processes cancellation', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders' && callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'o1',
                  order_number: 'ALT-2026-0001',
                  yookassa_payment_id: 'p1',
                  payment_status: 'pending',
                  total: 5000,
                  user_id: 'u1',
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
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'cancel' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.status).toBe('cancelled');
  });

  it('returns 500 on unexpected error', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('DB connection failed');
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
