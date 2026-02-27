'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statusOptions = [
  { value: 'pending', label: 'Ожидает оплаты' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

export default function StatusChangeForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === currentStatus) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка обновления статуса');
      }

      setMessage({ type: 'success', text: 'Статус обновлён' });
      router.refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Произошла ошибка',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-text-muted text-xs uppercase tracking-wider mb-1">
        Изменить статус
      </label>
      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-yellow/50 transition-colors appearance-none cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className="shrink-0 rounded-lg bg-accent-yellow text-bg-primary px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${message.type === 'success' ? 'text-green-400' : 'text-accent-magenta'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
