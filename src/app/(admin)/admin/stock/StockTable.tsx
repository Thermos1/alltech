'use client';

import { useState } from 'react';
import { formatPriceShort } from '@/lib/utils';

type StockItem = {
  id: string;
  productName: string;
  brandName: string;
  volume: string;
  stock_qty: number;
  price: number;
  sku: string | null;
};

function StockCell({ item }: { item: StockItem }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.stock_qty);
  const [saving, setSaving] = useState(false);
  const [displayQty, setDisplayQty] = useState(item.stock_qty);

  const stockColor =
    displayQty === 0
      ? 'text-accent-magenta bg-accent-magenta-dim'
      : displayQty < 5
      ? 'text-accent-yellow bg-accent-yellow-dim'
      : 'text-green-400 bg-green-500/15';

  async function handleSave() {
    if (value === displayQty) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stock/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_qty: value }),
      });

      if (res.ok) {
        setDisplayQty(value);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(displayQty);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={saving}
          autoFocus
          className="w-20 rounded-md bg-bg-secondary border border-accent-yellow px-2 py-1 text-center text-sm text-text-primary focus:outline-none"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:ring-1 hover:ring-accent-yellow/50 transition-all ${stockColor}`}
      title="Нажмите для редактирования"
    >
      {displayQty}
      <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
}

export default function StockTable({ items }: { items: StockItem[] }) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Товар</th>
              <th className="text-left px-4 py-3 font-medium">Бренд</th>
              <th className="text-left px-4 py-3 font-medium">Объём</th>
              <th className="text-center px-4 py-3 font-medium">Остаток</th>
              <th className="text-right px-4 py-3 font-medium">Цена</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-bg-card-hover transition-colors">
                <td className="px-4 py-3 text-text-primary font-medium">
                  {item.productName}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {item.brandName}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {item.volume}
                </td>
                <td className="px-4 py-3 text-center">
                  <StockCell item={item} />
                </td>
                <td className="px-4 py-3 text-right text-text-primary whitespace-nowrap">
                  {formatPriceShort(item.price)}
                </td>
                <td className="px-4 py-3 text-text-muted text-xs font-mono">
                  {item.sku || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
