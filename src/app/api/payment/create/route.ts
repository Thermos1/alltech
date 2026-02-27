import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // Generate mock payment ID
    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Update order with payment ID
    await admin
      .from('orders')
      .update({
        yookassa_payment_id: mockPaymentId,
        payment_status: 'waiting_for_capture',
      })
      .eq('id', orderId);

    // In real ЮKassa: create payment via API, return confirmation URL
    // For demo: redirect to mock payment page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${appUrl}/checkout/mock-pay?order_id=${orderId}&payment_id=${mockPaymentId}&amount=${order.total}`;

    return NextResponse.json({
      paymentUrl,
      paymentId: mockPaymentId,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 });
  }
}
