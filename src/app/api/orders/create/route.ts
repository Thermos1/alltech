import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkoutSchema } from '@/lib/validators';
import { generateOrderNumber } from '@/lib/utils';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createAdminClient();

    // Re-fetch prices from DB to prevent client-side tampering
    const variantIds = [...new Set(data.items.map((item) => item.variantId.replace(/:bulk$/, '')))];
    const { data: dbVariants, error: variantsError } = await admin
      .from('product_variants')
      .select('id, price, is_active')
      .in('id', variantIds);

    if (variantsError || !dbVariants) {
      return NextResponse.json({ error: 'Ошибка загрузки товаров' }, { status: 500 });
    }

    const priceMap = new Map(dbVariants.map((v) => [v.id, v]));

    // Validate all variants exist, are active, and recalculate subtotal with DB prices
    let subtotal = 0;
    for (const item of data.items) {
      const cleanId = item.variantId.replace(/:bulk$/, '');
      const dbVariant = priceMap.get(cleanId);
      if (!dbVariant) {
        return NextResponse.json(
          { error: `Товар "${item.productName}" не найден` },
          { status: 400 }
        );
      }
      if (!dbVariant.is_active) {
        return NextResponse.json(
          { error: `Товар "${item.productName}" больше не доступен` },
          { status: 400 }
        );
      }
      // Use DB price, not client price
      subtotal += dbVariant.price * item.quantity;
    }

    // Validate and apply promo code
    let discountAmount = 0;
    let promoCodeId: string | null = null;

    if (data.promoCode) {
      const { data: promo, error: promoError } = await admin
        .from('promo_codes')
        .select('*')
        .eq('code', data.promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!promoError && promo) {
        const now = new Date().toISOString();
        const validFrom = !promo.valid_from || promo.valid_from <= now;
        const validUntil = !promo.valid_until || promo.valid_until >= now;
        const underLimit = promo.max_uses === null || promo.used_count < promo.max_uses;
        const minMet = subtotal >= (promo.min_order_amount || 0);

        if (validFrom && validUntil && underLimit && minMet) {
          if (promo.discount_type === 'percent') {
            discountAmount = Math.floor(subtotal * promo.discount_value / 100);
          } else {
            discountAmount = Math.min(promo.discount_value, subtotal);
          }
          // Atomic increment with optimistic lock (prevents race condition on max_uses)
          const { data: updated } = await admin
            .from('promo_codes')
            .update({ used_count: promo.used_count + 1 })
            .eq('id', promo.id)
            .eq('used_count', promo.used_count)
            .select('id')
            .maybeSingle();

          if (updated) {
            promoCodeId = promo.id;
          } else {
            // Race condition: another order grabbed the last use
            discountAmount = 0;
          }
        }
      }
    }

    // Apply bonuses (1 bonus = 1 ruble, max 30% of subtotal)
    let bonusUsed = 0;
    if (data.useBonuses > 0) {
      const { data: profile } = await admin
        .from('profiles')
        .select('bonus_balance')
        .eq('id', user.id)
        .single();

      if (profile) {
        const maxBonus = Math.floor(subtotal * 0.3);
        bonusUsed = Math.min(data.useBonuses, profile.bonus_balance, maxBonus);
      }
    }

    const total = Math.max(subtotal - discountAmount - bonusUsed, 0);
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        delivery_address: data.deliveryAddress,
        delivery_notes: data.deliveryNotes || null,
        subtotal,
        discount_amount: discountAmount,
        bonus_used: bonusUsed,
        delivery_cost: 0,
        total,
        promo_code_id: promoCodeId,
        payment_status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 });
    }

    // Create order items (strip :bulk suffix from variantId for DB FK, use DB prices)
    const orderItems = data.items.map((item) => {
      const cleanId = item.variantId.replace(/:bulk$/, '');
      const dbPrice = priceMap.get(cleanId)!.price;
      return {
        order_id: order.id,
        variant_id: cleanId,
        product_name: item.productName,
        variant_label: item.variantLabel,
        quantity: item.quantity,
        unit_price: dbPrice,
        total_price: dbPrice * item.quantity,
      };
    });

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Rollback order
      await admin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Ошибка создания позиций заказа' }, { status: 500 });
    }

    // Deduct bonuses from profile + auto-fill full_name if empty
    const { data: profile } = await admin
      .from('profiles')
      .select('bonus_balance, full_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      const updates: Record<string, unknown> = {};
      if (bonusUsed > 0) {
        updates.bonus_balance = profile.bonus_balance - bonusUsed;
      }
      if (!profile.full_name && data.contactName) {
        updates.full_name = data.contactName;
      }
      // Save delivery address for next checkout
      if (data.deliveryAddress) {
        updates.delivery_address = data.deliveryAddress;
      }
      if (Object.keys(updates).length > 0) {
        await admin
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
      }
    }

    // If from shared cart, mark it as ordered
    if (data.sharedCartCode) {
      await admin
        .from('shared_carts')
        .update({ status: 'ordered', order_id: order.id })
        .eq('code', data.sharedCartCode)
        .in('status', ['pending', 'viewed']);

      await logActivity({
        actorId: user.id,
        action: 'shared_cart.ordered',
        entityType: 'shared_cart',
        details: { code: data.sharedCartCode, orderNumber: order.order_number },
      });
    }

    await logActivity({
      actorId: user.id,
      action: 'order.created',
      entityType: 'order',
      entityId: order.id,
      details: { total, orderNumber: order.order_number },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      subtotal,
      discountAmount,
      bonusUsed,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
