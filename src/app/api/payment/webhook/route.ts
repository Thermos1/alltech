import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBonusTier } from '@/lib/constants';
import { logActivity } from '@/lib/activity-log';

/**
 * YooKassa webhook handler.
 * Receives events: payment.succeeded, payment.canceled, refund.succeeded
 * Docs: https://yookassa.ru/developers/using-api/webhooks
 *
 * Always returns 200 to acknowledge receipt (fail-open).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.event;
    const payment = body.object;

    // Legacy mock webhook: { orderId, paymentId, action }
    if (!event || !payment) {
      return await handleLegacyWebhook(body);
    }

    const yookassaPaymentId = payment.id;
    const metadata = payment.metadata || {};
    const orderId = metadata.order_id;

    if (!orderId) {
      console.error('Webhook: missing order_id in metadata');
      return NextResponse.json({ status: 'ok' });
    }

    const admin = createAdminClient();

    // Find order by YooKassa payment ID
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, yookassa_payment_id, payment_status, total, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Webhook: order not found', orderId);
      return NextResponse.json({ status: 'ok' }); // Always 200
    }

    if (order.yookassa_payment_id !== yookassaPaymentId) {
      console.error('Webhook: payment ID mismatch', { expected: order.yookassa_payment_id, got: yookassaPaymentId });
      return NextResponse.json({ status: 'ok' });
    }

    if (event === 'payment.succeeded') {
      await handlePaymentSucceeded(admin, order);
    } else if (event === 'payment.canceled') {
      await handlePaymentCanceled(admin, order);
    } else if (event === 'refund.succeeded') {
      await handleRefundSucceeded(admin, order);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    // Always return 200 — YooKassa retries on non-200
    return NextResponse.json({ status: 'ok' });
  }
}

// ─── payment.succeeded ──────────────────────────────────────

async function handlePaymentSucceeded(admin: ReturnType<typeof createAdminClient>, order: {
  id: string; order_number: string; payment_status: string; total: number; user_id: string;
}) {
  // Idempotency: skip if already processed
  if (order.payment_status === 'succeeded') return;

  // Mark as paid
  await admin
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

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

      await admin.from('commission_log').insert({
        manager_id: userProfile.manager_id,
        order_id: order.id,
        order_total: Number(order.total),
        rate: commissionRate,
        amount: commission,
      });
    }
  }

  // Decrement stock for ordered items
  const { data: orderItems } = await admin
    .from('order_items')
    .select('variant_id, quantity, product_name')
    .eq('order_id', order.id);

  for (const item of orderItems || []) {
    if (item.variant_id) {
      await admin.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      });
    }
  }

  if ((orderItems || []).length > 0) {
    await logActivity({
      actorId: order.user_id,
      action: 'stock.decremented',
      entityType: 'order',
      entityId: order.id,
      details: {
        orderNumber: order.order_number,
        items: (orderItems || []).map((i) => `${i.product_name} ×${i.quantity}`).join(', '),
      },
    });
  }

  // Check referral bonus (first purchase by referred user, no self-referral)
  if (userProfile?.referred_by && userProfile.referred_by !== order.user_id) {
    const { count: existingReferralCount } = await admin
      .from('referral_events')
      .select('id', { count: 'exact', head: true })
      .eq('referred_id', order.user_id);

    if (existingReferralCount === 0) {
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

        await admin.from('referral_events').insert({
          referrer_id: userProfile.referred_by,
          referred_id: userProfile.id,
          order_id: order.id,
          bonus_awarded: referralBonus,
        });
      }
    }
  }

  await logActivity({
    actorId: order.user_id,
    action: 'order.paid',
    entityType: 'order',
    entityId: order.id,
    details: { total: Number(order.total), orderNumber: order.order_number },
  });
}

// ─── payment.canceled ───────────────────────────────────────

async function handlePaymentCanceled(admin: ReturnType<typeof createAdminClient>, order: {
  id: string; order_number: string; payment_status: string; user_id: string;
}) {
  if (order.payment_status === 'cancelled') return;

  await admin
    .from('orders')
    .update({
      payment_status: 'cancelled',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);
}

// ─── refund.succeeded ───────────────────────────────────────

async function handleRefundSucceeded(admin: ReturnType<typeof createAdminClient>, order: {
  id: string; order_number: string; user_id: string;
}) {
  await admin
    .from('orders')
    .update({
      payment_status: 'refunded',
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  await logActivity({
    actorId: order.user_id,
    action: 'order.refunded',
    entityType: 'order',
    entityId: order.id,
    details: { orderNumber: order.order_number },
  });
}

// ─── Legacy mock webhook (backward compat) ──────────────────

async function handleLegacyWebhook(body: { orderId?: string; paymentId?: string; action?: string }) {
  const { orderId, paymentId, action } = body;

  if (!orderId || !paymentId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, order_number, yookassa_payment_id, payment_status, total, user_id')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.yookassa_payment_id !== paymentId) {
    return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
  }

  if (action === 'pay') {
    await handlePaymentSucceeded(admin, order);
    return NextResponse.json({ success: true, orderNumber: order.order_number, status: 'paid' });
  } else {
    await handlePaymentCanceled(admin, order);
    return NextResponse.json({ success: true, orderNumber: order.order_number, status: 'cancelled' });
  }
}
