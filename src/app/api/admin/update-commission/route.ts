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

    const { managerId, rate } = await request.json();

    if (!managerId || rate === undefined) {
      return NextResponse.json({ error: 'Missing managerId or rate' }, { status: 400 });
    }

    const numRate = Math.max(0, Math.min(100, Number(rate)));

    const admin = createAdminClient();

    const { error } = await admin
      .from('profiles')
      .update({ manager_commission_rate: numRate })
      .eq('id', managerId)
      .eq('role', 'manager');

    if (error) {
      console.error('Commission update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update commission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
