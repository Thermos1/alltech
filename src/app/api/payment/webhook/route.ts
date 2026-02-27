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

      // Load user profile for bonus operations
      const { data: userProfile } = await admin
        .from('profiles')
        .select('id, bonus_balance, referred_by')
        .eq('id', order.user_id)
        .single();

      // Award bonuses (5% of total)
      const bonusToAward = Math.floor(Number(order.total) * 0.05);
      if (bonusToAward > 0 && userProfile) {
        await admin
          .from('profiles')
          .update({
            bonus_balance: userProfile.bonus_balance + bonusToAward,
          })
          .eq('id', order.user_id);
      }

      // Check referral bonus (first purchase by referred user)
      if (userProfile?.referred_by) {
        // Check if user already has a referral event (prevents double-award)
        const { count: existingReferralCount } = await admin
          .from('referral_events')
          .select('id', { count: 'exact', head: true })
          .eq('referred_id', order.user_id);

        if (existingReferralCount === 0) {
          // First purchase — award referrer bonus
          const referralBonus = 500;
          const { data: referrer } = await admin
            .from('profiles')
            .select('bonus_balance')
            .eq('id', userProfile.referred_by)
            .single();

          if (referrer) {
            await admin
              .from('profiles')
              .update({ bonus_balance: referrer.bonus_balance + referralBonus })
              .eq('id', userProfile.referred_by);

            // Record referral event
            await admin.from('referral_events').insert({
              referrer_id: userProfile.referred_by,
              referred_id: userProfile.id,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
