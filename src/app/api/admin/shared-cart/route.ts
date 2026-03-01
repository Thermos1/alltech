import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';

function generateCartCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = admin
    .from('shared_carts')
    .select('id, code, manager_id, client_id, status, notes, created_at')
    .order('created_at', { ascending: false });

  // Manager sees only their own carts
  if (profile.role === 'manager') {
    query = query.eq('manager_id', user.id);
  }

  const { data: carts } = await query;
  return NextResponse.json(carts || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { items, clientId, notes } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Items required' }, { status: 400 });
  }

  const code = generateCartCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const { data: cart, error } = await admin
    .from('shared_carts')
    .insert({
      code,
      manager_id: user.id,
      client_id: clientId || null,
      status: 'pending',
      notes: notes || null,
      expires_at: expiresAt.toISOString(),
    })
    .select('id, code')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert cart items
  const cartItems = items.map((item: { variantId: string; quantity: number; note?: string }) => ({
    shared_cart_id: cart.id,
    variant_id: item.variantId,
    quantity: item.quantity,
    note: item.note || null,
  }));

  const { error: itemsError } = await admin
    .from('shared_cart_items')
    .insert(cartItems);

  if (itemsError) {
    // Cleanup cart on error
    await admin.from('shared_carts').delete().eq('id', cart.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  await logActivity({
    actorId: user.id,
    action: 'shared_cart.created',
    entityType: 'shared_cart',
    entityId: cart.id,
    details: { code, itemCount: items.length },
  });

  return NextResponse.json({ id: cart.id, code: cart.code });
}
