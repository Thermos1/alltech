'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const PERIODS = [
  { key: 'today', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал' },
  { key: '6m', label: 'Полгода' },
  { key: 'year', label: 'Год' },
  { key: 'all', label: 'Всё время' },
] as const;

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('period') || 'month';

  function handleClick(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'month') {
      params.delete('period');
    } else {
      params.set('period', key);
    }
    const qs = params.toString();
    router.push(`/admin/analytics${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => handleClick(p.key)}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border',
            active === p.key
              ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
              : 'border-border-subtle bg-bg-card text-text-muted hover:text-text-secondary'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
