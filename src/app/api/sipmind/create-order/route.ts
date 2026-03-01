import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySipmindAuth } from '@/lib/sipmind/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    if (!verifySipmindAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Неавторизованный запрос' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_slug, variant_id, quantity, phone, name } = body as {
      product_slug: string;
      variant_id?: string;
      quantity: number;
      phone: string;
      name: string;
    };

    // Validate required fields
    if (!product_slug) {
      return NextResponse.json(
        { success: false, message: 'Не указан товар (product_slug)' },
        { status: 400 }
      );
    }
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Укажите количество (минимум 1)' },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Укажите номер телефона клиента' },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Укажите имя клиента' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Find product
    const { data: product, error: productError } = await admin
      .from('products')
      .select('id, name, slug, brands(name)')
      .eq('slug', product_slug)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, message: `Товар '${product_slug}' не найден в каталоге` },
        { status: 404 }
      );
    }

    // Find variant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectedVariant: any = null;

    if (variant_id) {
      // Use specified variant
      const { data: variant, error: variantError } = await admin
        .from('product_variants')
        .select('id, volume, unit, price, stock_qty')
        .eq('id', variant_id)
        .eq('product_id', product.id)
        .eq('is_active', true)
        .single();

      if (variantError || !variant) {
        return NextResponse.json(
          { success: false, message: 'Указанный вариант товара не найден' },
          { status: 404 }
        );
      }
      selectedVariant = variant;
    } else {
      // Use cheapest active variant
      const { data: variants, error: variantsError } = await admin
        .from('product_variants')
        .select('id, volume, unit, price, stock_qty')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(1);

      if (variantsError || !variants || variants.length === 0) {
        return NextResponse.json(
          { success: false, message: 'У товара нет доступных вариантов' },
          { status: 404 }
        );
      }
      selectedVariant = variants[0];
    }

    const unitPrice = Number(selectedVariant.price);
    const totalPrice = unitPrice * quantity;
    const variantLabel = `${selectedVariant.volume} ${selectedVariant.unit}`;
    const orderNumber = generateOrderNumber();

    // Look up existing user by phone (link order if found)
    const cleanPhone = phone.replace(/\D/g, '');
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    // Create order (user_id is nullable — voice orders may not have a registered user)
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: existingProfile?.id || null,
        guest_phone: existingProfile ? null : cleanPhone,
        status: 'pending',
        contact_name: name,
        contact_phone: phone,
        subtotal: totalPrice,
        discount_amount: 0,
        bonus_used: 0,
        delivery_cost: 0,
        total: totalPrice,
        payment_status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('SIPmind create-order error:', orderError);
      return NextResponse.json(
        { success: false, message: 'Ошибка создания заказа. Попробуйте позже.' },
        { status: 500 }
      );
    }

    // Create order item
    const { error: itemError } = await admin.from('order_items').insert({
      order_id: order.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      variant_label: variantLabel,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    });

    if (itemError) {
      console.error('SIPmind create-order item error:', itemError);
      // Rollback order
      await admin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { success: false, message: 'Ошибка добавления товара в заказ' },
        { status: 500 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandObj = product.brands as any;
    const brandName = brandObj?.name ?? '';
    const productFullName = brandName
      ? `${brandName} ${product.name}`
      : product.name;

    return NextResponse.json({
      success: true,
      message: `Заказ ${orderNumber} создан. ${productFullName}, ${variantLabel} x ${quantity} шт. Итого: ${totalPrice} руб. Менеджер свяжется с вами по номеру ${phone}.`,
      order_number: orderNumber,
      total: totalPrice,
      product_name: productFullName,
      variant_label: variantLabel,
      quantity,
      status: 'created',
    });
  } catch (error) {
    console.error('SIPmind create-order error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
