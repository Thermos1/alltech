import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Введите промокод' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: promo, error } = await admin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'Промокод не найден' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (promo.valid_from && promo.valid_from > now) {
      return NextResponse.json({ error: 'Промокод ещё не активен' }, { status: 400 });
    }

    if (promo.valid_until && promo.valid_until < now) {
      return NextResponse.json({ error: 'Промокод истёк' }, { status: 400 });
    }

    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Промокод использован максимальное число раз' }, { status: 400 });
    }

    if (promo.min_order_amount && subtotal < promo.min_order_amount) {
      return NextResponse.json({
        error: `Минимальная сумма заказа: ${promo.min_order_amount} ₽`,
      }, { status: 400 });
    }

    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = Math.floor(subtotal * promo.discount_value / 100);
    } else {
      discount = Math.min(promo.discount_value, subtotal);
    }

    return NextResponse.json({
      discount,
      type: promo.discount_type,
      value: promo.discount_value,
      code: promo.code,
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
