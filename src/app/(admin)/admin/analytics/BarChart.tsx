'use client';

import { formatPriceShort } from '@/lib/utils';

export default function BarChart({
  data,
  maxValue,
  formatAs,
}: {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  formatAs?: 'price' | 'number';
}) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const format = formatAs === 'price' ? formatPriceShort : (v: number) => v.toString();

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-text-muted text-xs w-24 truncate shrink-0 text-right">
            {item.label}
          </span>
          <div className="flex-1 h-6 rounded-md bg-bg-secondary overflow-hidden relative">
            <div
              className={`h-full rounded-md transition-all ${item.color || 'bg-accent-yellow'}`}
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-text-primary text-xs font-medium w-20 text-right shrink-0">
            {format(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
