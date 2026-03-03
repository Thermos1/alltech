import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recognizeProduct } from '@/lib/image-processing';

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

    const { image, mediaType } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URI prefix if present
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const detectedType = image.startsWith('data:image/png') ? 'image/png'
      : image.startsWith('data:image/webp') ? 'image/webp'
      : 'image/jpeg';

    const recognized = await recognizeProduct(
      base64Data,
      (mediaType || detectedType) as 'image/jpeg' | 'image/png' | 'image/webp'
    );

    return NextResponse.json({ recognized });
  } catch (error) {
    console.error('Recognize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
