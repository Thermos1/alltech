import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockServerFrom,
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn(),
}));

const { POST } = await import('@/app/api/orders/create/route');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = 'user-test-uuid';

function createPostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  contactName: 'Иван Иванов',
  contactPhone: '+7 900 111-11-11',
  deliveryAddress: 'г. Якутск, ул. Ленина, д. 1',
  items: [
    {
      variantId: 'v1',
      productName: 'ROLF GT 5W-40',
      variantLabel: '4 л',
      quantity: 2,
      price: 2500,
    },
  ],
};

/** Default profile stub: no bonus balance, has full_name. */
function profilesStub(overrides?: { bonus_balance?: number; full_name?: string | null }) {
  const data = {
    bonus_balance: overrides?.bonus_balance ?? 0,
    full_name: overrides?.full_name !== undefined ? overrides.full_name : 'Иван Иванов',
  };
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data, error: null }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  };
}

/** Order insert stub. */
function ordersInsertStub(id = 'o1', orderNumber = 'ALT-2026-0001') {
  return {
    insert: () => ({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id, order_number: orderNumber },
            error: null,
          }),
      }),
    }),
  };
}

/** Order items insert stub (success). */
function orderItemsStub() {
  return {
    insert: () => Promise.resolve({ error: null }),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('POST /api/orders/create — full checkout flow + sharedCartCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
  });

  // -----------------------------------------------------------------------
  // 1. Auth
  // -----------------------------------------------------------------------
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const res = await POST(createPostRequest(validBody) as never);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe('Необходима авторизация');
  });

  // -----------------------------------------------------------------------
  // 2. Validation
  // -----------------------------------------------------------------------
  it('returns 400 for invalid body (missing required fields)', async () => {
    const res = await POST(
      createPostRequest({ contactName: 'A' }) as never,
    );
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Ошибка валидации');
    expect(data.details).toBeDefined();
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 400 when items array is empty', async () => {
    const res = await POST(
      createPostRequest({ ...validBody, items: [] }) as never,
    );
    expect(res.status).toBe(400);
  });

  // -----------------------------------------------------------------------
  // 3. Basic success flow (no promo, no bonuses)
  // -----------------------------------------------------------------------
  it('creates order successfully without promo or bonuses', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o1', 'ALT-2026-0001');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(createPostRequest(validBody) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe('o1');
    expect(data.orderNumber).toBe('ALT-2026-0001');
    expect(data.subtotal).toBe(5000); // 2500 * 2
    expect(data.discountAmount).toBe(0);
    expect(data.bonusUsed).toBe(0);
    expect(data.total).toBe(5000);
  });

  // -----------------------------------------------------------------------
  // 4. Promo code (percent type)
  // -----------------------------------------------------------------------
  it('applies promo code discount (percent type)', async () => {
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
                      code: 'PROMO10',
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
      if (table === 'orders') return ordersInsertStub('o2', 'ALT-2026-0002');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(
      createPostRequest({ ...validBody, promoCode: 'PROMO10' }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    // subtotal = 5000, 10% discount = 500
    expect(data.discountAmount).toBe(500);
    expect(data.total).toBe(4500);
  });

  // -----------------------------------------------------------------------
  // 5. Bonus deduction (capped at 30%)
  // -----------------------------------------------------------------------
  it('applies bonus deduction capped at 30% of subtotal', async () => {
    // Profile calls happen twice: once for bonus check, once after order
    let profileCallCount = 0;

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        profileCallCount++;
        // Both calls return the same structure; the route reads
        // bonus_balance for the first and bonus_balance + full_name for the second.
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { bonus_balance: 10000, full_name: 'Иван' },
                  error: null,
                }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'orders') return ordersInsertStub('o3', 'ALT-2026-0003');
      if (table === 'order_items') return orderItemsStub();
      return {};
    });

    // useBonuses = 10000 but 30% of subtotal(5000) = 1500
    const res = await POST(
      createPostRequest({ ...validBody, useBonuses: 10000 }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bonusUsed).toBe(1500);
    expect(data.total).toBe(3500); // 5000 - 1500
    // profiles was called at least twice (bonus check + post-order update)
    expect(profileCallCount).toBeGreaterThanOrEqual(2);
  });

  // -----------------------------------------------------------------------
  // 6. sharedCartCode — updates shared_carts status
  // -----------------------------------------------------------------------
  it('creates order with sharedCartCode and updates shared_carts status', async () => {
    const sharedCartCode = 'SC-TEST-1234';
    const mockSharedCartUpdate = vi.fn().mockReturnValue({
      eq: () => ({
        in: () => Promise.resolve({ error: null }),
      }),
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o4', 'ALT-2026-0004');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      if (table === 'shared_carts') {
        return {
          update: mockSharedCartUpdate,
        };
      }
      return {};
    });

    const res = await POST(
      createPostRequest({ ...validBody, sharedCartCode }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe('o4');

    // Verify shared_carts.update was called with correct payload
    expect(mockSharedCartUpdate).toHaveBeenCalledWith({
      status: 'ordered',
      order_id: 'o4',
    });
  });

  // -----------------------------------------------------------------------
  // 7. Strips :bulk suffix from variantId
  // -----------------------------------------------------------------------
  it('strips :bulk suffix from variantId in order_items', async () => {
    const capturedItems: Record<string, unknown>[] = [];

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o5', 'ALT-2026-0005');
      if (table === 'order_items') {
        return {
          insert: (items: Record<string, unknown>[]) => {
            capturedItems.push(...items);
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const bodyWithBulk = {
      ...validBody,
      items: [
        {
          variantId: 'v1:bulk',
          productName: 'ROLF GT 5W-40',
          variantLabel: '20 л бочка',
          quantity: 1,
          price: 12000,
        },
        {
          variantId: 'v2',
          productName: 'KIXX G1 5W-30',
          variantLabel: '4 л',
          quantity: 3,
          price: 2000,
        },
      ],
    };

    const res = await POST(createPostRequest(bodyWithBulk) as never);
    expect(res.status).toBe(200);

    // First item should have :bulk stripped
    expect(capturedItems[0].variant_id).toBe('v1');
    // Second item has no suffix — unchanged
    expect(capturedItems[1].variant_id).toBe('v2');
  });

  // -----------------------------------------------------------------------
  // 8. Auto-fills full_name when profile.full_name is empty
  // -----------------------------------------------------------------------
  it('auto-fills full_name when profile.full_name is empty', async () => {
    const capturedUpdates: Record<string, unknown>[] = [];

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o6', 'ALT-2026-0006');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { bonus_balance: 0, full_name: null },
                  error: null,
                }),
            }),
          }),
          update: (upd: Record<string, unknown>) => {
            capturedUpdates.push(upd);
            return {
              eq: () => Promise.resolve({ error: null }),
            };
          },
        };
      }
      return {};
    });

    const res = await POST(createPostRequest(validBody) as never);
    expect(res.status).toBe(200);

    // Profile update should include full_name = contactName
    expect(capturedUpdates.length).toBeGreaterThanOrEqual(1);
    const update = capturedUpdates[0];
    expect(update.full_name).toBe('Иван Иванов');
  });

  // -----------------------------------------------------------------------
  // 9. Returns 500 on order insert error
  // -----------------------------------------------------------------------
  it('returns 500 on order insert error', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: null,
                  error: { message: 'DB constraint violation' },
                }),
            }),
          }),
        };
      }
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(createPostRequest(validBody) as never);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe('Ошибка создания заказа');
  });

  // -----------------------------------------------------------------------
  // 10. Returns 500 on order_items insert error and rolls back order
  // -----------------------------------------------------------------------
  it('returns 500 on order_items insert error and rolls back order', async () => {
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'o-rollback', order_number: 'ALT-2026-ROLL' },
                  error: null,
                }),
            }),
          }),
          delete: () => ({
            eq: mockDeleteEq,
          }),
        };
      }
      if (table === 'order_items') {
        return {
          insert: () =>
            Promise.resolve({ error: { message: 'FK violation' } }),
        };
      }
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(createPostRequest(validBody) as never);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe('Ошибка создания позиций заказа');

    // Verify rollback: orders.delete().eq('id', orderId) was called
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'o-rollback');
  });

  // -----------------------------------------------------------------------
  // 11. Applies fixed-amount promo code
  // -----------------------------------------------------------------------
  it('applies fixed-amount promo code', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'promo-fix',
                      code: 'FLAT500',
                      discount_type: 'fixed',
                      discount_value: 500,
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
      if (table === 'orders') return ordersInsertStub('o7', 'ALT-2026-0007');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(
      createPostRequest({ ...validBody, promoCode: 'FLAT500' }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.discountAmount).toBe(500);
    expect(data.total).toBe(4500); // 5000 - 500
  });

  // -----------------------------------------------------------------------
  // 12. Does not apply promo code when over max_uses
  // -----------------------------------------------------------------------
  it('ignores promo code that exceeded max_uses', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'promo-maxed',
                      code: 'MAXED',
                      discount_type: 'percent',
                      discount_value: 50,
                      is_active: true,
                      valid_from: null,
                      valid_until: null,
                      max_uses: 5,
                      used_count: 5, // used_count == max_uses => limit reached
                      min_order_amount: 0,
                    },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      if (table === 'orders') return ordersInsertStub('o8', 'ALT-2026-0008');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const res = await POST(
      createPostRequest({ ...validBody, promoCode: 'MAXED' }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    // Promo should NOT be applied because used_count >= max_uses
    expect(data.discountAmount).toBe(0);
    expect(data.total).toBe(5000);
  });

  // -----------------------------------------------------------------------
  // 13. Bonus deduction uses minimum of requested, balance, and 30% cap
  // -----------------------------------------------------------------------
  it('bonus deduction is min(useBonuses, balance, 30% cap)', async () => {
    // balance = 800, 30% of 5000 = 1500, useBonuses = 2000
    // expected: min(2000, 800, 1500) = 800
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { bonus_balance: 800, full_name: 'Иван' },
                  error: null,
                }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'orders') return ordersInsertStub('o9', 'ALT-2026-0009');
      if (table === 'order_items') return orderItemsStub();
      return {};
    });

    const res = await POST(
      createPostRequest({ ...validBody, useBonuses: 2000 }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bonusUsed).toBe(800);
    expect(data.total).toBe(4200); // 5000 - 800
  });

  // -----------------------------------------------------------------------
  // 14. Does not update shared_carts when sharedCartCode is absent
  // -----------------------------------------------------------------------
  it('does not touch shared_carts when sharedCartCode is absent', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o10', 'ALT-2026-0010');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      if (table === 'shared_carts') {
        throw new Error('shared_carts should not be accessed');
      }
      return {};
    });

    const res = await POST(createPostRequest(validBody) as never);
    expect(res.status).toBe(200);

    // If we got here without the throw, shared_carts was not touched
    expect(mockAdminFrom).not.toHaveBeenCalledWith('shared_carts');
  });

  // -----------------------------------------------------------------------
  // 15. Multiple items calculate subtotal correctly
  // -----------------------------------------------------------------------
  it('calculates subtotal correctly with multiple items', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') return ordersInsertStub('o11', 'ALT-2026-0011');
      if (table === 'order_items') return orderItemsStub();
      if (table === 'profiles') return profilesStub();
      return {};
    });

    const multiItemBody = {
      ...validBody,
      items: [
        { variantId: 'v1', productName: 'Oil A', variantLabel: '4 л', quantity: 2, price: 2500 },
        { variantId: 'v2', productName: 'Oil B', variantLabel: '1 л', quantity: 5, price: 800 },
        { variantId: 'v3', productName: 'Filter C', variantLabel: '1 шт', quantity: 1, price: 1200 },
      ],
    };

    const res = await POST(createPostRequest(multiItemBody) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    // 2500*2 + 800*5 + 1200*1 = 5000 + 4000 + 1200 = 10200
    expect(data.subtotal).toBe(10200);
    expect(data.total).toBe(10200);
  });
});
