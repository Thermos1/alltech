import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { clientId, managerId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const admin = createAdminClient();

    await admin
      .from('profiles')
      .update({ manager_id: managerId || null })
      .eq('id', clientId);

    await logActivity({
      actorId: user.id,
      action: 'client.assign_manager',
      entityType: 'profile',
      entityId: clientId,
      details: { managerId: managerId || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Assign manager error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
