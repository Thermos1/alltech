import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productUpdateSchema } from '@/lib/validators';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    }

    const { error } = await admin
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Product update error:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const admin = createAdminClient();

    // Check if any variant is referenced in order_items or shared_cart_items
    const { data: variants } = await admin
      .from('product_variants')
      .select('id')
      .eq('product_id', id);

    const variantIds = (variants || []).map((v) => v.id);

    let hasOrders = false;
    if (variantIds.length > 0) {
      const { count } = await admin
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .in('variant_id', variantIds);

      hasOrders = (count ?? 0) > 0;
    }

    if (hasOrders) {
      // Soft delete: deactivate product and all its variants
      await admin
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      await admin
        .from('product_variants')
        .update({ is_active: false })
        .eq('product_id', id);

      return NextResponse.json({ success: true, soft: true });
    }

    // Clean shared_cart_items referencing these variants
    if (variantIds.length > 0) {
      await admin
        .from('shared_cart_items')
        .delete()
        .in('variant_id', variantIds);
    }

    // Hard delete: no orders reference this product
    await admin
      .from('product_variants')
      .delete()
      .eq('product_id', id);

    const { error } = await admin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Product delete error:', error);
      return NextResponse.json({ error: 'Не удалось удалить товар' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
