'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function StockFilters({
  brands,
}: {
  brands: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const q = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const low = searchParams.get('low') || '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  function handleSearch(value: string) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams('q', value), 300);
  }

  const inputClass =
    'rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        defaultValue={q}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Поиск по названию..."
        className={`flex-1 ${inputClass}`}
      />
      <select
        value={brand}
        onChange={(e) => updateParams('brand', e.target.value)}
        className={`sm:w-44 ${inputClass}`}
      >
        <option value="">Все бренды</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => updateParams('low', low ? '' : '1')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
          low
            ? 'bg-accent-magenta text-white'
            : 'bg-bg-secondary text-text-muted border border-border-subtle hover:text-text-primary'
        }`}
      >
        {low ? 'Низкий остаток' : 'Низкий остаток'}
      </button>
    </div>
  );
}
