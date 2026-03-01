import { createAdminClient } from '@/lib/supabase/admin';

export async function logActivity({
  actorId,
  action,
  entityType,
  entityId,
  details,
}: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  await admin.from('activity_log').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || {},
  });
}
