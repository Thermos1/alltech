import { createAdminClient } from '@/lib/supabase/admin';

const DECAY_MONTHS = 3;

export async function checkCashbackDecay(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<{ decayed: boolean; previousBalance: number; monthsSinceLastPurchase: number }> {
  const { data: profile } = await admin
    .from('profiles')
    .select('bonus_balance, last_purchase_at')
    .eq('id', userId)
    .single();

  if (!profile || !profile.last_purchase_at || profile.bonus_balance <= 0) {
    return { decayed: false, previousBalance: 0, monthsSinceLastPurchase: 0 };
  }

  const lastPurchase = new Date(profile.last_purchase_at);
  const now = new Date();
  const diffMs = now.getTime() - lastPurchase.getTime();
  const monthsSince = diffMs / (1000 * 60 * 60 * 24 * 30.44); // average month

  if (monthsSince >= DECAY_MONTHS) {
    const previousBalance = profile.bonus_balance;

    await admin
      .from('profiles')
      .update({ bonus_balance: 0 })
      .eq('id', userId);

    return { decayed: true, previousBalance, monthsSinceLastPurchase: Math.floor(monthsSince) };
  }

  return { decayed: false, previousBalance: profile.bonus_balance, monthsSinceLastPurchase: Math.floor(monthsSince) };
}
