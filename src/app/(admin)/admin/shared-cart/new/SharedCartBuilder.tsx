'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatPriceShort } from '@/lib/utils';

type CatalogProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  variants: {
    id: string;
    volume: string;
    price: number;
    stock: number;
  }[];
};

type CartEntry = {
  variantId: string;
  productName: string;
  volume: string;
  price: number;
  quantity: number;
};

export default function SharedCartBuilder({
  catalog,
  clients,
}: {
  catalog: CatalogProduct[];
  clients: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ code: string } | null>(null);

  const filtered = useMemo(() => {
    if (!search) return catalog.slice(0, 20);
    const s = search.toLowerCase();
    return catalog.filter((p) => p.name.toLowerCase().includes(s)).slice(0, 20);
  }, [search, catalog]);

  function addToCart(product: CatalogProduct, variant: CatalogProduct['variants'][0]) {
    setCart((prev) => {
      const existing = prev.find((e) => e.variantId === variant.id);
      if (existing) {
        return prev.map((e) =>
          e.variantId === variant.id ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, {
        variantId: variant.id,
        productName: product.name,
        volume: variant.volume,
        price: variant.price,
        quantity: 1,
      }];
    });
  }

  function updateQty(variantId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((e) => e.variantId !== variantId));
    } else {
      setCart((prev) => prev.map((e) =>
        e.variantId === variantId ? { ...e, quantity: qty } : e
      ));
    }
  }

  const total = cart.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const totalItems = cart.reduce((sum, e) => sum + e.quantity, 0);

  async function handleCreate() {
    if (cart.length === 0) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/shared-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((e) => ({ variantId: e.variantId, quantity: e.quantity })),
          clientId: clientId || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ code: data.code });
      }
    } finally {
      setCreating(false);
    }
  }

  const shareUrl = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/cart/share/${result.code}`
    : '';

  const inputClass =
    'rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';

  if (result) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
        <div className="text-center">
          <p className="text-green-400 font-medium text-lg mb-2">Корзина создана!</p>
          <p className="text-text-muted text-sm mb-4">
            Код: <span className="font-mono font-bold text-text-primary">{result.code}</span>
          </p>
        </div>

        <div className="rounded-lg bg-bg-secondary p-3">
          <p className="text-text-muted text-xs mb-1">Ссылка для клиента:</p>
          <p className="text-accent-cyan text-sm font-mono break-all">{shareUrl}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
            }}
            className="flex-1 rounded-lg bg-accent-cyan text-bg-primary px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all"
          >
            Скопировать ссылку
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Ваша корзина от АЛТЕХ: ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-green-500 transition-all text-center"
          >
            WhatsApp
          </a>
        </div>

        <button
          onClick={() => router.push('/admin/shared-cart')}
          className="w-full rounded-lg bg-bg-secondary text-text-muted px-4 py-2 text-sm hover:text-text-primary transition-colors"
        >
          К списку корзин
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product search */}
      <div className="lg:col-span-2 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск товаров..."
          className={`w-full ${inputClass}`}
        />

        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="rounded-xl bg-bg-card border border-border-subtle p-3"
            >
              <p className="text-text-primary font-medium text-sm mb-2">{product.name}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const inCart = cart.find((e) => e.variantId === variant.id);
                  return (
                    <button
                      key={variant.id}
                      onClick={() => addToCart(product, variant)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        inCart
                          ? 'bg-accent-yellow text-bg-primary'
                          : variant.stock === 0
                          ? 'bg-bg-secondary text-text-muted opacity-50 cursor-not-allowed'
                          : 'bg-bg-secondary text-text-secondary hover:bg-accent-yellow/20 hover:text-accent-yellow'
                      }`}
                      disabled={variant.stock === 0}
                    >
                      {variant.volume} — {formatPriceShort(variant.price)}
                      {inCart && ` (${inCart.quantity})`}
                      {variant.stock === 0 && ' нет'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-text-muted text-sm text-center py-6">Товары не найдены</p>
          )}
        </div>
      </div>

      {/* Right: Cart summary */}
      <div className="space-y-4">
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4 sticky top-4">
          <h3 className="text-text-primary font-medium mb-3">
            Корзина ({totalItems})
          </h3>

          {cart.length === 0 ? (
            <p className="text-text-muted text-xs">Добавьте товары из каталога</p>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map((entry) => (
                <div key={entry.variantId} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary text-xs truncate">{entry.productName}</p>
                    <p className="text-text-muted text-[10px]">
                      {entry.volume} — {formatPriceShort(entry.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(entry.variantId, entry.quantity - 1)}
                      className="w-6 h-6 rounded bg-bg-secondary text-text-muted hover:text-text-primary text-xs flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs text-text-primary font-medium">
                      {entry.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(entry.variantId, entry.quantity + 1)}
                      className="w-6 h-6 rounded bg-bg-secondary text-text-muted hover:text-text-primary text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              <div className="border-t border-border-subtle pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Итого:</span>
                  <span className="text-accent-yellow font-display text-lg">{formatPriceShort(total)}</span>
                </div>
              </div>

              {/* Client select */}
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={`w-full mb-3 ${inputClass}`}
              >
                <option value="">Без привязки к клиенту</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Комментарий для клиента..."
                rows={2}
                className={`w-full mb-3 resize-none ${inputClass}`}
              />

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full rounded-lg bg-accent-yellow text-bg-primary px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {creating ? 'Создание...' : 'Создать и получить ссылку'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
