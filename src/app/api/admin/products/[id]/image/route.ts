import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (file.size > 500_000) {
      return NextResponse.json({ error: 'Image too large (max 500KB)' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get product for path construction
    const { data: product } = await admin
      .from('products')
      .select('slug, brand:brands(slug)')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const brandSlug = Array.isArray(product.brand)
      ? product.brand[0]?.slug
      : (product.brand as { slug: string } | null)?.slug || 'unknown';

    const filePath = `${brandSlug}/${product.slug}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload (upsert to overwrite existing)
    const { error: uploadError } = await admin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // Update product with image URL
    const imageUrl = urlData.publicUrl;
    await admin
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', id);

    return NextResponse.json({ image_url: imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
