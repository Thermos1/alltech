import Link from 'next/link';

export const metadata = {
  title: 'Заказ оплачен — АЛТЕХ',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-accent-cyan/10 border-2 border-accent-cyan flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-accent-cyan"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="font-display text-2xl text-text-primary mb-2">
        Заказ оплачен!
      </h1>

      {orderNumber && (
        <p className="text-accent-yellow-text font-display text-lg mb-4">
          {orderNumber}
        </p>
      )}

      <p className="text-text-secondary text-sm mb-8 max-w-xs mx-auto">
        Спасибо за покупку! Мы начали обработку вашего заказа.
        Следите за статусом в личном кабинете.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/cabinet/orders"
          className="inline-flex items-center justify-center rounded-xl bg-accent-yellow text-text-on-accent px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
        >
          Мои заказы
        </Link>
        <Link
          href="/catalog/lubricants"
          className="inline-flex items-center justify-center rounded-xl bg-bg-card border border-border-subtle text-text-primary px-6 py-3 text-sm font-medium transition-all hover:bg-bg-card-hover"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
}
