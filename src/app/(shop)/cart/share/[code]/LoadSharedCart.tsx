'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { formatPriceShort } from '@/lib/utils';

type SharedCartData = {
  code: string;
  notes: string | null;
  managerName: string;
  items: {
    variantId: string;
    productId: string;
    productName: string;
    variantLabel: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
};

export default function LoadSharedCart({ code }: { code: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const [data, setData] = useState<SharedCartData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/shared-cart/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Ошибка загрузки');
        }
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  function handleLoad() {
    if (!data) return;
    clearCart();
    for (const item of data.items) {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          price: item.price,
          imageUrl: item.imageUrl,
        });
      }
    }
    setLoaded(true);
    setTimeout(() => router.push('/checkout'), 1000);
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center max-w-md w-full">
        <p className="text-text-muted text-sm">Загрузка корзины...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center max-w-md w-full">
        <p className="text-accent-magenta font-medium mb-2">
          {error === 'Cart expired' ? 'Срок корзины истёк' :
           error === 'Cart already ordered' ? 'Корзина уже оформлена' :
           error === 'Cart not found' ? 'Корзина не найдена' : error}
        </p>
        <p className="text-text-muted text-xs mb-4">
          Свяжитесь с менеджером для получения новой ссылки
        </p>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-bg-secondary text-text-muted px-4 py-2 text-sm hover:text-text-primary transition-colors"
        >
          На главную
        </button>
      </div>
    );
  }

  if (loaded) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center max-w-md w-full">
        <p className="text-green-400 font-medium text-lg mb-2">Корзина загружена!</p>
        <p className="text-text-muted text-sm">Переход к оформлению...</p>
      </div>
    );
  }

  if (!data) return null;

  const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-6 max-w-lg w-full space-y-4">
      <div className="text-center mb-4">
        <p className="text-text-primary font-display text-xl mb-1">Корзина от {data.managerName}</p>
        {data.notes && (
          <p className="text-text-muted text-sm">{data.notes}</p>
        )}
      </div>

      <div className="space-y-2">
        {data.items.map((item) => (
          <div key={item.variantId} className="flex justify-between items-center rounded-lg bg-bg-secondary p-3">
            <div className="min-w-0 flex-1">
              <p className="text-text-primary text-sm font-medium truncate">{item.productName}</p>
              <p className="text-text-muted text-xs">
                {item.variantLabel} x {item.quantity}
              </p>
            </div>
            <p className="text-text-primary font-medium text-sm whitespace-nowrap ml-3">
              {formatPriceShort(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border-subtle pt-3">
        <div className="flex justify-between items-center mb-4">
          <span className="text-text-muted">Итого:</span>
          <span className="text-accent-yellow-text font-display text-xl">{formatPriceShort(total)}</span>
        </div>

        <button
          onClick={handleLoad}
          className="w-full rounded-lg bg-accent-yellow text-text-on-accent px-4 py-3 text-sm font-medium hover:brightness-110 transition-all"
        >
          Загрузить в корзину и оформить
        </button>
      </div>
    </div>
  );
}
