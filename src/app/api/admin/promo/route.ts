import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';
import { z } from 'zod/v4';

const promoCreateSchema = z.object({
  code: z.string().min(1, 'Введите код').max(30).transform((v) => v.toUpperCase().trim()),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive('Значение должно быть больше 0'),
  min_order_amount: z.number().min(0).default(0),
  max_uses: z.number().int().positive().nullable().default(null),
  valid_from: z.string().nullable().default(null),
  valid_until: z.string().nullable().default(null),
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = promoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createAdminClient();

    // Check for duplicate code
    const { data: existing } = await admin
      .from('promo_codes')
      .select('id')
      .eq('code', data.code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Промокод "${data.code}" уже существует` },
        { status: 409 }
      );
    }

    const { data: promo, error } = await admin
      .from('promo_codes')
      .insert({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount,
        max_uses: data.max_uses,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: true,
        used_count: 0,
      })
      .select('id, code')
      .single();

    if (error) {
      console.error('Promo create error:', error);
      return NextResponse.json({ error: 'Ошибка создания промокода' }, { status: 500 });
    }

    await logActivity({
      actorId: user.id,
      action: 'promo.created',
      entityType: 'promo_code',
      entityId: promo.id,
      details: { code: data.code, discount_type: data.discount_type, discount_value: data.discount_value },
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error('Promo API error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
