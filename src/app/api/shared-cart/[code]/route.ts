import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const admin = createAdminClient();

  const { data: cart } = await admin
    .from('shared_carts')
    .select('id, code, status, notes, expires_at, manager_id')
    .eq('code', code)
    .single();

  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  if (cart.status === 'expired' || cart.status === 'ordered') {
    return NextResponse.json({
      error: cart.status === 'expired' ? 'Cart expired' : 'Cart already ordered',
      status: cart.status,
    }, { status: 410 });
  }

  // Check expiry
  if (cart.expires_at && new Date(cart.expires_at) < new Date()) {
    await admin.from('shared_carts').update({ status: 'expired' }).eq('id', cart.id);
    return NextResponse.json({ error: 'Cart expired', status: 'expired' }, { status: 410 });
  }

  // Mark as viewed
  if (cart.status === 'pending') {
    await admin.from('shared_carts').update({ status: 'viewed' }).eq('id', cart.id);
  }

  // Get cart items with variant/product details
  const { data: items } = await admin
    .from('shared_cart_items')
    .select('id, variant_id, quantity, note')
    .eq('shared_cart_id', cart.id);

  const variantIds = (items || []).map((i) => i.variant_id);
  const { data: variants } = variantIds.length > 0
    ? await admin
        .from('product_variants')
        .select('id, volume, price, product_id')
        .in('id', variantIds)
    : { data: [] };

  const productIds = [...new Set((variants || []).map((v) => v.product_id))];
  const { data: products } = productIds.length > 0
    ? await admin
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds)
    : { data: [] };

  const productMap: Record<string, { name: string; image_url: string | null }> = {};
  (products || []).forEach((p) => {
    productMap[p.id] = { name: p.name, image_url: p.image_url };
  });

  const variantMap: Record<string, { volume: string; price: number; productId: string; productName: string; imageUrl: string | null }> = {};
  (variants || []).forEach((v) => {
    variantMap[v.id] = {
      volume: v.volume,
      price: v.price,
      productId: v.product_id,
      productName: productMap[v.product_id]?.name || '—',
      imageUrl: productMap[v.product_id]?.image_url || null,
    };
  });

  const enrichedItems = (items || []).map((item) => {
    const variant = variantMap[item.variant_id];
    return {
      variantId: item.variant_id,
      productId: variant?.productId || '',
      productName: variant?.productName || '—',
      variantLabel: variant?.volume || '—',
      price: variant?.price || 0,
      quantity: item.quantity,
      imageUrl: variant?.imageUrl || undefined,
    };
  });

  // Get manager name
  const { data: manager } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', cart.manager_id)
    .single();

  return NextResponse.json({
    code: cart.code,
    notes: cart.notes,
    managerName: manager?.full_name || 'Менеджер',
    items: enrichedItems,
  });
}
