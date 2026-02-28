import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { POST } = await import('@/app/api/promo/validate/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/promo/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when code is missing', async () => {
    const res = await POST(createRequest({ subtotal: 10000 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 404 when promo code not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'INVALID', subtotal: 10000 }) as never);
    expect(res.status).toBe(404);
  });

  it('returns 400 when promo code is expired', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'p1',
                  code: 'OLD',
                  discount_type: 'percent',
                  discount_value: 10,
                  is_active: true,
                  valid_from: null,
                  valid_until: '2020-01-01T00:00:00Z',
                  max_uses: null,
                  used_count: 0,
                  min_order_amount: null,
                },
                error: null,
              }),
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'OLD', subtotal: 10000 }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('истёк');
  });

  it('returns 400 when max uses reached', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'p2',
                  code: 'MAXED',
                  discount_type: 'percent',
                  discount_value: 5,
                  is_active: true,
                  valid_from: null,
                  valid_until: null,
                  max_uses: 10,
                  used_count: 10,
                  min_order_amount: null,
                },
                error: null,
              }),
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'MAXED', subtotal: 10000 }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('максимальное');
  });

  it('returns 400 when order below minimum amount', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'p3',
                  code: 'MINORDER',
                  discount_type: 'flat',
                  discount_value: 500,
                  is_active: true,
                  valid_from: null,
                  valid_until: null,
                  max_uses: null,
                  used_count: 0,
                  min_order_amount: 50000,
                },
                error: null,
              }),
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'MINORDER', subtotal: 10000 }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('50000');
  });

  it('calculates percent discount correctly', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'p4',
                  code: 'SALE15',
                  discount_type: 'percent',
                  discount_value: 15,
                  is_active: true,
                  valid_from: null,
                  valid_until: null,
                  max_uses: null,
                  used_count: 0,
                  min_order_amount: null,
                },
                error: null,
              }),
          }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'SALE15', subtotal: 100000 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.discount).toBe(15000); // 15% of 100000
    expect(data.type).toBe('percent');
    expect(data.value).toBe(15);
    expect(data.code).toBe('SALE15');
  });

  it('calculates flat discount correctly, capping at subtotal', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'p5',
                  code: 'FLAT500',
                  discount_type: 'flat',
                  discount_value: 5000,
                  is_active: true,
                  valid_from: null,
                  valid_until: null,
                  max_uses: null,
                  used_count: 0,
                  min_order_amount: null,
                },
                error: null,
              }),
          }),
        }),
      }),
    });

    // Subtotal lower than flat discount — should cap
    const res = await POST(createRequest({ code: 'FLAT500', subtotal: 3000 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.discount).toBe(3000); // capped at subtotal
    expect(data.type).toBe('flat');
  });
});
