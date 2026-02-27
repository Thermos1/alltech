'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn, formatPriceShort } from '@/lib/utils';

export default function MockPayForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const amount = Number(searchParams.get('amount') || 0);

  async function handleAction(action: 'pay' | 'cancel') {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка обработки платежа');
        setProcessing(false);
        return;
      }

      if (action === 'pay' && data.success) {
        router.push(`/checkout/success?order=${data.orderNumber}`);
      } else if (action === 'cancel') {
        router.push('/cart');
      } else {
        setError('Не удалось обработать платёж');
        setProcessing(false);
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Bank logo */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            ₽
          </div>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-wider">
            Демо-оплата (песочница)
          </p>
        </div>

        {/* Payment info */}
        <h1 className="text-gray-900 text-lg font-medium mb-1">
          Оплата заказа
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Магазин АЛТЕХ
        </p>

        {/* Amount */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-gray-500 text-sm">К оплате</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPriceShort(amount)}
          </p>
        </div>

        {/* Card form (mock) */}
        <div className="space-y-3 mb-6 text-left">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Номер карты</label>
            <input
              type="text"
              defaultValue="4242 4242 4242 4242"
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm bg-gray-50"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-gray-500 text-xs mb-1">Срок</label>
              <input
                type="text"
                defaultValue="12/29"
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-500 text-xs mb-1">CVV</label>
              <input
                type="text"
                defaultValue="123"
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => handleAction('pay')}
            disabled={processing}
            className={cn(
              'w-full rounded-xl py-3.5 text-white font-semibold transition-all',
              'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {processing ? 'Обработка...' : `Оплатить ${formatPriceShort(amount)}`}
          </button>

          <button
            onClick={() => handleAction('cancel')}
            disabled={processing}
            className="w-full rounded-xl py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Отменить
          </button>
        </div>

        <p className="text-gray-400 text-[10px] mt-4">
          Это демо-страница оплаты. В продакшне будет редирект на ЮKassa.
        </p>
      </div>
    </div>
  );
}
