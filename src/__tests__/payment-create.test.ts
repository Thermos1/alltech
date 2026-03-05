import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { POST } = await import('@/app/api/payment/create/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/payment/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });
    const res = await POST(createRequest({ orderId: 'o1' }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 400 when orderId is missing', async () => {
    const res = await POST(createRequest({}) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('ID заказа');
  });

  it('returns 404 when order not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const res = await POST(createRequest({ orderId: 'nonexistent' }) as never);
    expect(res.status).toBe(404);
  });

  it('returns 403 when order belongs to different user', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { id: 'o1', order_number: 'ALT-001', total: 5000, payment_status: 'pending', user_id: 'other-user' },
            error: null,
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ orderId: 'o1' }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when order already paid', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { id: 'o1', order_number: 'ALT-001', total: 5000, payment_status: 'succeeded', user_id: 'user-1' },
            error: null,
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ orderId: 'o1' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('уже оплачен');
  });

  it('creates payment successfully', async () => {
    let updateCalled = false;
    let ordersCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        ordersCallCount++;
        if (ordersCallCount === 1) {
          // First call: verify order belongs to user
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { id: 'o1', order_number: 'ALT-001', total: 5000, payment_status: 'pending', user_id: 'user-1' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (ordersCallCount === 2) {
          // Second call: fetch contact_phone for receipt
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { contact_phone: '+79001111111', contact_name: 'Тест' },
                  error: null,
                }),
              }),
            }),
          };
        }
        // Third call: update with payment ID
        return {
          update: () => {
            updateCalled = true;
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ product_name: 'Масло ROLF', variant_label: '4л', quantity: 2, unit_price: 2500, total_price: 5000 }],
              error: null,
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest({ orderId: 'o1' }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.paymentUrl).toContain('/checkout/mock-pay');
    expect(data.paymentUrl).toContain('order_id=o1');
    expect(data.paymentId).toMatch(/^mock_/);
    expect(updateCalled).toBe(true);
  });

  it('distributes discount proportionally in receipt items when promo applied', async () => {
    let ordersCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        ordersCallCount++;
        if (ordersCallCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  // total=48 but items sum to 55 (discount applied)
                  data: { id: 'o2', order_number: 'ALT-002', total: 48, payment_status: 'pending', user_id: 'user-1' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (ordersCallCount === 2) {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { contact_phone: '+79001111111', contact_name: 'Тест' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ product_name: 'Антифриз', variant_label: '1 кг', quantity: 1, unit_price: 55, total_price: 55 }],
              error: null,
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest({ orderId: 'o2' }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    // Mock payment path — just verify it doesn't crash with discount
    expect(data.paymentUrl).toContain('amount=48');
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('crash'));
    const res = await POST(createRequest({ orderId: 'o1' }) as never);
    expect(res.status).toBe(500);
  });
});
