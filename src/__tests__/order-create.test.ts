import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServerAuth = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockServerAuth },
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { POST } = await import('@/app/api/orders/create/route');

const validItem = {
  variantId: 'a0000000-0000-1000-8000-000000000001',
  productName: 'Test Oil',
  variantLabel: '20 л',
  quantity: 2,
  price: 10000,
};

const validBody = {
  contactName: 'Тест Клиент',
  contactPhone: '+79001234567',
  deliveryAddress: 'г. Якутск, ул. Тестовая 1',
  items: [validItem],
  useBonuses: 0,
};

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/orders/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServerAuth.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockServerAuth.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid checkout data', async () => {
    const res = await POST(createRequest({ contactName: 'A' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Ошибка валидации');
  });

  it('returns 400 when items array is empty', async () => {
    const res = await POST(createRequest({ ...validBody, items: [] }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing contactPhone', async () => {
    const { contactPhone: _, ...noPhone } = validBody;
    const res = await POST(createRequest(noPhone) as never);
    expect(res.status).toBe(400);
  });

  it('creates order successfully without promo or bonuses', async () => {
    // Mock order insert
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'order-1', order_number: 'ALT-TEST-001' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'order_items') {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    });

    const res = await POST(createRequest(validBody) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.orderNumber).toBe('ALT-TEST-001');
    expect(data.subtotal).toBe(20000); // 10000 * 2
    expect(data.discountAmount).toBe(0);
    expect(data.bonusUsed).toBe(0);
  });

  it('applies percent promo code', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'promo-1',
                      code: 'SALE10',
                      discount_type: 'percent',
                      discount_value: 10,
                      is_active: true,
                      valid_from: null,
                      valid_until: null,
                      max_uses: null,
                      used_count: 0,
                      min_order_amount: 0,
                    },
                    error: null,
                  }),
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'order-2', order_number: 'ALT-TEST-002' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'order_items') {
        return { insert: () => Promise.resolve({ error: null }) };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    });

    const res = await POST(createRequest({ ...validBody, promoCode: 'SALE10' }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.discountAmount).toBe(2000); // 10% of 20000
    expect(data.total).toBe(18000);
  });

  it('applies bonuses with 30% max cap', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { bonus_balance: 50000 },
                  error: null,
                }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'order-3', order_number: 'ALT-TEST-003' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'order_items') {
        return { insert: () => Promise.resolve({ error: null }) };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    });

    // useBonuses = 50000, but max 30% of subtotal (20000) = 6000
    const res = await POST(createRequest({ ...validBody, useBonuses: 50000 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.bonusUsed).toBe(6000);
    expect(data.total).toBe(14000);
  });

  it('rolls back order if items creation fails', async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'order-fail', order_number: 'ALT-TEST-FAIL' },
                  error: null,
                }),
            }),
          }),
          delete: mockDelete,
        };
      }
      if (table === 'order_items') {
        return {
          insert: () => Promise.resolve({ error: { message: 'FK violation' } }),
        };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    });

    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(500);
    expect(mockDelete).toHaveBeenCalled();
  });
});
