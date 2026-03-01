import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: cart } = await admin
    .from('shared_carts')
    .select('*')
    .eq('id', id)
    .single();

  if (!cart) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Manager can only see their own carts
  if (profile.role === 'manager' && cart.manager_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: items } = await admin
    .from('shared_cart_items')
    .select('id, variant_id, quantity, note')
    .eq('shared_cart_id', id);

  // Get variant details
  const variantIds = (items || []).map((i) => i.variant_id);
  const { data: variants } = variantIds.length > 0
    ? await admin
        .from('product_variants')
        .select('id, volume, price, product_id')
        .in('id', variantIds)
    : { data: [] };

  const productIds = [...new Set((variants || []).map((v) => v.product_id))];
  const { data: products } = productIds.length > 0
    ? await admin.from('products').select('id, name').in('id', productIds)
    : { data: [] };

  const productMap: Record<string, string> = {};
  (products || []).forEach((p) => { productMap[p.id] = p.name; });

  const variantMap: Record<string, { volume: string; price: number; productName: string }> = {};
  (variants || []).forEach((v) => {
    variantMap[v.id] = {
      volume: v.volume,
      price: v.price,
      productName: productMap[v.product_id] || '—',
    };
  });

  const enrichedItems = (items || []).map((item) => ({
    ...item,
    ...(variantMap[item.variant_id] || { volume: '—', price: 0, productName: '—' }),
  }));

  return NextResponse.json({ ...cart, items: enrichedItems });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: cart } = await admin
    .from('shared_carts')
    .select('manager_id')
    .eq('id', id)
    .single();

  if (!cart) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (profile.role === 'manager' && cart.manager_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await admin.from('shared_carts').update({ status: 'expired' }).eq('id', id);

  return NextResponse.json({ success: true });
}
