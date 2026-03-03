import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin client
const mockFrom = vi.fn();

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

const mockOrder = {
  id: 'o1',
  order_number: 'ALT-2026-0001',
  yookassa_payment_id: 'pay-123',
  payment_status: 'pending',
  total: 5000,
  user_id: 'u1',
};

function setupOrderMock(order: Record<string, unknown> | null, error: Record<string, unknown> | null = null) {
  let selectCallCount = 0;
  mockFrom.mockImplementation((table: string) => {
    if (table === 'orders' && selectCallCount === 0) {
      selectCallCount++;
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: order, error }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
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
              data: { id: 'u1', bonus_balance: 100, referred_by: null, total_spent: 0, manager_id: null },
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
    return {
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      insert: () => Promise.resolve({ error: null }),
    };
  });
}

// ─── YooKassa webhook format ────────────────────────────────

describe('POST /api/payment/webhook (YooKassa format)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for empty body', async () => {
    const req = createRequest({});
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('handles payment.succeeded event', async () => {
    setupOrderMock(mockOrder);

    const req = createRequest({
      event: 'payment.succeeded',
      object: {
        id: 'pay-123',
        status: 'succeeded',
        amount: { value: '5000.00', currency: 'RUB' },
        metadata: { order_id: 'o1', order_number: 'ALT-2026-0001' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('handles payment.canceled event', async () => {
    setupOrderMock(mockOrder);

    const req = createRequest({
      event: 'payment.canceled',
      object: {
        id: 'pay-123',
        status: 'canceled',
        metadata: { order_id: 'o1' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });

  it('handles refund.succeeded event', async () => {
    setupOrderMock({ ...mockOrder, payment_status: 'succeeded' });

    const req = createRequest({
      event: 'refund.succeeded',
      object: {
        id: 'refund-1',
        payment_id: 'pay-123',
        metadata: { order_id: 'o1' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });

  it('returns 200 even when order not found (fail-open)', async () => {
    setupOrderMock(null, { message: 'not found' });

    const req = createRequest({
      event: 'payment.succeeded',
      object: {
        id: 'pay-123',
        metadata: { order_id: 'nonexistent' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200); // Always 200 for YooKassa
  });

  it('returns 200 on payment ID mismatch (fail-open)', async () => {
    setupOrderMock(mockOrder);

    const req = createRequest({
      event: 'payment.succeeded',
      object: {
        id: 'wrong-payment-id',
        metadata: { order_id: 'o1' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });

  it('skips duplicate payment (idempotency)', async () => {
    setupOrderMock({ ...mockOrder, payment_status: 'succeeded' });

    const req = createRequest({
      event: 'payment.succeeded',
      object: {
        id: 'pay-123',
        metadata: { order_id: 'o1' },
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});

// ─── Legacy mock webhook format ─────────────────────────────

describe('POST /api/payment/webhook (legacy format)', () => {
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
            data: { ...mockOrder, yookassa_payment_id: 'different-payment' },
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
    setupOrderMock({ ...mockOrder, yookassa_payment_id: 'p1' });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderNumber).toBe('ALT-2026-0001');
    expect(data.status).toBe('paid');
  });

  it('processes cancellation', async () => {
    setupOrderMock({ ...mockOrder, yookassa_payment_id: 'p1' });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'cancel' });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.status).toBe('cancelled');
  });

  it('returns 200 on unexpected error (fail-open)', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('DB connection failed');
    });

    const req = createRequest({ orderId: 'o1', paymentId: 'p1', action: 'pay' });
    const res = await POST(req as never);
    expect(res.status).toBe(200); // Webhook always returns 200
  });
});
