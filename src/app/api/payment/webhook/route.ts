import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, action } = await request.json();

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify order exists and payment matches
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, yookassa_payment_id, total, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.yookassa_payment_id !== paymentId) {
      return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
    }

    if (action === 'pay') {
      // Mark as paid
      await admin
        .from('orders')
        .update({
          payment_status: 'succeeded',
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Award bonuses (5% of total)
      const bonusToAward = Math.floor(Number(order.total) * 0.05);
      if (bonusToAward > 0) {
        const { data: profile } = await admin
          .from('profiles')
          .select('bonus_balance')
          .eq('id', order.user_id)
          .single();

        if (profile) {
          await admin
            .from('profiles')
            .update({
              bonus_balance: profile.bonus_balance + bonusToAward,
            })
            .eq('id', order.user_id);
        }
      }

      // Check referral bonus (first purchase by referred user)
      const { data: profile } = await admin
        .from('profiles')
        .select('id, referred_by')
        .eq('id', order.user_id)
        .single();

      if (profile?.referred_by) {
        // Check if this is the user's first completed order
        const { count } = await admin
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', order.user_id)
          .eq('payment_status', 'succeeded');

        if (count === 1) {
          // First purchase — award referrer bonus
          const referralBonus = 500;
          const { data: referrer } = await admin
            .from('profiles')
            .select('bonus_balance')
            .eq('id', profile.referred_by)
            .single();

          if (referrer) {
            await admin
              .from('profiles')
              .update({ bonus_balance: referrer.bonus_balance + referralBonus })
              .eq('id', profile.referred_by);

            // Record referral event
            await admin.from('referral_events').insert({
              referrer_id: profile.referred_by,
              referred_id: profile.id,
              order_id: orderId,
              bonus_awarded: referralBonus,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        status: 'paid',
      });
    } else {
      // Cancel payment
      await admin
        .from('orders')
        .update({
          payment_status: 'cancelled',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        status: 'cancelled',
      });
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    // Always return 200 for webhook (fail-open pattern)
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
