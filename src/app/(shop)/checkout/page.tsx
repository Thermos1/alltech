import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CheckoutForm from './CheckoutForm';

export const metadata = {
  title: 'Оформление заказа — АЛТЕХ',
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/checkout');
  }

  // Load user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, bonus_balance, company_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <h1 className="font-display text-2xl text-text-primary mb-6">
        Оформление заказа
      </h1>
      <CheckoutForm
        profile={profile as { full_name: string; phone: string; bonus_balance: number; company_name: string } | null}
      />
    </div>
  );
}
