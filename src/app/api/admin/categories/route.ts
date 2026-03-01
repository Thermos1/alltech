import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { categoryCreateSchema } from '@/lib/validators';
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
    const parsed = categoryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let slug = data.slug || slugify(data.name);

    const admin = createAdminClient();

    // Ensure unique slug
    const { data: existing } = await admin
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: category, error } = await admin
      .from('categories')
      .insert({
        name: data.name,
        slug,
        section: data.section,
        parent_id: data.parent_id || null,
        icon_url: data.icon_url || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
      })
      .select('id, name, slug')
      .single();

    if (error) {
      console.error('Category create error:', error);
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
