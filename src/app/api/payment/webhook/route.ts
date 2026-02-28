import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBonusTier } from '@/lib/constants';

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

      // Load user profile for bonus and CRM operations
      const { data: userProfile } = await admin
        .from('profiles')
        .select('id, bonus_balance, referred_by, total_spent, manager_id')
        .eq('id', order.user_id)
        .single();

      if (userProfile) {
        // Update total_spent
        const newTotalSpent = Number(userProfile.total_spent || 0) + Number(order.total);

        // Award bonuses by tier (based on cumulative total_spent AFTER this order)
        const tier = getBonusTier(newTotalSpent);
        const bonusToAward = Math.floor(Number(order.total) * tier.percent / 100);

        await admin
          .from('profiles')
          .update({
            bonus_balance: userProfile.bonus_balance + bonusToAward,
            total_spent: newTotalSpent,
          })
          .eq('id', order.user_id);
      }

      // Award manager commission
      if (userProfile?.manager_id) {
        const { data: manager } = await admin
          .from('profiles')
          .select('manager_commission, manager_commission_rate')
          .eq('id', userProfile.manager_id)
          .single();

        if (manager) {
          const commissionRate = Number(manager.manager_commission_rate || 3);
          const commission = Math.floor(Number(order.total) * commissionRate / 100);
          await admin
            .from('profiles')
            .update({
              manager_commission: Number(manager.manager_commission || 0) + commission,
            })
            .eq('id', userProfile.manager_id);
        }
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
