import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://altehspec.ru';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Не указан ID заказа' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify order belongs to user
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, total, payment_status, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    if (order.payment_status === 'succeeded') {
      return NextResponse.json({ error: 'Заказ уже оплачен' }, { status: 400 });
    }

    // Fetch order items + contact phone for receipt (54-ФЗ)
    const { data: orderItems } = await admin
      .from('order_items')
      .select('product_name, variant_label, quantity, unit_price, total_price')
      .eq('order_id', orderId);

    const { data: orderFull } = await admin
      .from('orders')
      .select('contact_phone, contact_name')
      .eq('id', orderId)
      .single();

    // Idempotency key — prevents duplicate payments for the same order
    const idempotencyKey = `order_${orderId}_${Date.now()}`;

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      // Fallback: mock payment (dev mode without YooKassa keys)
      const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await admin
        .from('orders')
        .update({ yookassa_payment_id: mockPaymentId, payment_status: 'waiting_for_capture' })
        .eq('id', orderId);

      return NextResponse.json({
        paymentUrl: `/checkout/mock-pay?order_id=${orderId}&payment_id=${mockPaymentId}&amount=${order.total}`,
        paymentId: mockPaymentId,
      });
    }

    // Create payment via YooKassa API
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    // Build receipt items for 54-ФЗ fiscal compliance
    const receiptItems = (orderItems || []).map((item) => ({
      description: `${item.product_name} (${item.variant_label})`.slice(0, 128),
      quantity: String(item.quantity),
      amount: {
        value: Number(item.unit_price).toFixed(2),
        currency: 'RUB' as const,
      },
      vat_code: 7, // НДС 22% (ОСНО)
      payment_subject: 'commodity' as const,
      payment_mode: 'full_payment' as const,
    }));

    // Customer contact for receipt
    const customerPhone = orderFull?.contact_phone?.replace(/[^\d+]/g, '') || undefined;

    const yooRes = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Idempotence-Key': idempotencyKey,
      },
      body: JSON.stringify({
        amount: {
          value: Number(order.total).toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: `${APP_URL}/cabinet/orders?paid=${order.order_number}`,
        },
        capture: true,
        description: `Заказ №${order.order_number} — АЛТЕХ`,
        receipt: {
          customer: {
            ...(customerPhone ? { phone: customerPhone } : {}),
          },
          items: receiptItems,
        },
        metadata: {
          order_id: orderId,
          order_number: order.order_number,
        },
      }),
    });

    if (!yooRes.ok) {
      const errBody = await yooRes.text();
      console.error('YooKassa API error:', yooRes.status, errBody);
      return NextResponse.json({ error: 'Ошибка платёжной системы' }, { status: 502 });
    }

    const payment = await yooRes.json();

    // Save YooKassa payment ID to order
    await admin
      .from('orders')
      .update({
        yookassa_payment_id: payment.id,
        payment_status: 'pending',
      })
      .eq('id', orderId);

    return NextResponse.json({
      paymentUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 });
  }
}
