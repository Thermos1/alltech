import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productCreateSchema } from '@/lib/validators';
import { slugify } from '@/lib/slugify';

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

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let slug = data.slug || slugify(data.name);

    // Ensure unique slug
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: product, error } = await admin
      .from('products')
      .insert({
        name: data.name,
        slug,
        description: data.description || null,
        section: data.section,
        brand_id: data.brand_id,
        category_id: data.category_id,
        viscosity: data.viscosity || null,
        base_type: data.base_type || null,
        api_spec: data.api_spec || null,
        acea_spec: data.acea_spec || null,
        approvals: data.approvals || null,
        oem_codes: data.oem_codes || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error('Product create error:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
