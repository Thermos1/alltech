import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod/v4';
import { generateAiPlan } from '@/lib/ai-plan';

const aiPlanSchema = z.object({
  prompt: z.string().min(1).max(5000),
  imageCount: z.number().int().min(0).max(20),
  style: z.string().max(50).optional(),
  platform: z.string().max(50).optional(),
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
    const parseResult = aiPlanSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: parseResult.error.issues },
        { status: 400 },
      );
    }

    const result = await generateAiPlan(parseResult.data);

    if (!result) {
      return NextResponse.json(
        { error: 'AI-генерация недоступна. Настройте ANTHROPIC_API_KEY в переменных окружения.' },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AI-PLAN] Route error:', error);
    return NextResponse.json(
      { error: 'Ошибка AI-генерации. Попробуйте снова.' },
      { status: 500 },
    );
  }
}
