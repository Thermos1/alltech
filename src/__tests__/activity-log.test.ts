import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'activity_log') {
        return { insert: mockInsert };
      }
      return {};
    },
  }),
}));

const { logActivity } = await import('@/lib/activity-log');

describe('logActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it('inserts activity with all fields', async () => {
    await logActivity({
      actorId: 'user-1',
      action: 'order.paid',
      entityType: 'order',
      entityId: 'order-123',
      details: { total: 5000, orderNumber: 'ALT-001' },
    });

    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'user-1',
      action: 'order.paid',
      entity_type: 'order',
      entity_id: 'order-123',
      details: { total: 5000, orderNumber: 'ALT-001' },
    });
  });

  it('inserts activity without optional entityId', async () => {
    await logActivity({
      actorId: 'user-1',
      action: 'promo.deleted',
      entityType: 'promo_code',
      details: { code: 'SALE10' },
    });

    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'user-1',
      action: 'promo.deleted',
      entity_type: 'promo_code',
      entity_id: null,
      details: { code: 'SALE10' },
    });
  });

  it('inserts activity without optional details', async () => {
    await logActivity({
      actorId: 'user-1',
      action: 'manager.created',
      entityType: 'profile',
      entityId: 'mgr-1',
    });

    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'user-1',
      action: 'manager.created',
      entity_type: 'profile',
      entity_id: 'mgr-1',
      details: {},
    });
  });

  it('inserts with minimal required fields', async () => {
    await logActivity({
      actorId: 'user-1',
      action: 'login',
      entityType: 'session',
    });

    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'user-1',
      action: 'login',
      entity_type: 'session',
      entity_id: null,
      details: {},
    });
  });

  it('calls admin from activity_log table', async () => {
    await logActivity({
      actorId: 'user-1',
      action: 'test',
      entityType: 'test',
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });
});
