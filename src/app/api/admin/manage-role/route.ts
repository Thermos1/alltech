import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, newRole, commissionRate } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 });
    }

    if (!['customer', 'manager'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Don't allow changing own role
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });
    }

    const admin = createAdminClient();

    const updateData: Record<string, unknown> = { role: newRole };

    // If promoting to manager, set commission rate
    if (newRole === 'manager' && commissionRate !== undefined) {
      updateData.manager_commission_rate = Math.max(0, Math.min(100, Number(commissionRate)));
    }

    // If demoting from manager, unassign all clients
    if (newRole === 'customer') {
      await admin
        .from('profiles')
        .update({ manager_id: null })
        .eq('manager_id', userId);
    }

    const { error } = await admin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Role update error:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manage role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
