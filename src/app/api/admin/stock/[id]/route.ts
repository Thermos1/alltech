import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';
import { z } from 'zod/v4';

const stockUpdateSchema = z.object({
  stock_qty: z.number().int().min(0, 'Остаток не может быть отрицательным'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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
    const parsed = stockUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get current variant for logging
    const { data: variant, error: fetchError } = await admin
      .from('product_variants')
      .select('id, stock_qty, volume, product_id')
      .eq('id', id)
      .single();

    if (fetchError || !variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const oldQty = variant.stock_qty;
    const newQty = parsed.data.stock_qty;

    const { error: updateError } = await admin
      .from('product_variants')
      .update({ stock_qty: newQty })
      .eq('id', id);

    if (updateError) {
      console.error('Stock update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    // Get product name for log
    const { data: product } = await admin
      .from('products')
      .select('name')
      .eq('id', variant.product_id)
      .single();

    await logActivity({
      actorId: user.id,
      action: 'stock.updated',
      entityType: 'product_variant',
      entityId: id,
      details: {
        productName: product?.name || '—',
        volume: variant.volume,
        oldQty,
        newQty,
      },
    });

    return NextResponse.json({ success: true, stock_qty: newQty });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
