import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { variantCreateSchema } from '@/lib/validators';

export async function POST(
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
    const parsed = variantCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createAdminClient();

    const { data: variant, error } = await admin
      .from('product_variants')
      .insert({
        product_id: id,
        volume: data.volume,
        unit: data.unit,
        price: data.price,
        price_per_liter: data.price_per_liter || null,
        sku: data.sku || null,
        stock_qty: data.stock_qty,
        is_active: data.is_active,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Variant create error:', error);
      return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
    }

    return NextResponse.json({ variant });
  } catch (error) {
    console.error('Variant create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
