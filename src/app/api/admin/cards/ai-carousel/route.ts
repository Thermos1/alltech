import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod/v4';
import { generateCarouselContent } from '@/lib/ai-carousel';

const aiCarouselSchema = z.object({
  productName: z.string().min(1).max(200),
  productDescription: z.string().max(3000).optional(),
  brand: z.string().max(50).optional(),
  specs: z.array(z.object({
    label: z.string().max(100),
    value: z.string().max(200),
  })).max(20).optional(),
  category: z.string().max(100).optional(),
});

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

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = aiCarouselSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: parseResult.error.issues },
        { status: 400 },
      );
    }

    const result = await generateCarouselContent(parseResult.data);

    if (!result) {
      return NextResponse.json(
        { error: 'AI-генерация недоступна. Проверьте ANTHROPIC_API_KEY.' },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AI-CAROUSEL] Route error:', error);
    return NextResponse.json(
      { error: 'Ошибка AI-генерации. Попробуйте снова.' },
      { status: 500 },
    );
  }
}
