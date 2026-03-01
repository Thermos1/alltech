'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function ClientFilters({
  managers,
  isAdmin,
}: {
  managers: { id: string; full_name: string | null }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const q = searchParams.get('q') || '';
  const manager = searchParams.get('manager') || '';
  const status = searchParams.get('status') || '';

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
        placeholder="Поиск по имени или телефону..."
        className={`flex-1 ${inputClass}`}
      />
      {isAdmin && (
        <select
          value={manager}
          onChange={(e) => updateParams('manager', e.target.value)}
          className={`sm:w-48 ${inputClass}`}
        >
          <option value="">Все менеджеры</option>
          <option value="none">Без менеджера</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name || m.id.slice(0, 8)}
            </option>
          ))}
        </select>
      )}
      <select
        value={status}
        onChange={(e) => updateParams('status', e.target.value)}
        className={`sm:w-36 ${inputClass}`}
      >
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="cooling">Остывает</option>
        <option value="new">Новый</option>
      </select>
    </div>
  );
}
