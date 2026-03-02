'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PromoActionsProps {
  promoId: string;
  promoCode: string;
  isActive: boolean;
  usedCount: number;
}

export default function PromoActions({ promoId, promoCode, isActive, usedCount }: PromoActionsProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/promo/${promoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Ошибка обновления');
        return;
      }

      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить промокод «${promoCode}»?\n\nЭто действие нельзя отменить.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promo/${promoId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Ошибка удаления');
        return;
      }

      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? 'text-accent-magenta bg-accent-magenta-dim hover:bg-accent-magenta/20'
            : 'text-green-400 bg-green-500/15 hover:bg-green-500/25'
        }`}
      >
        {toggling ? '...' : isActive ? 'Выкл' : 'Вкл'}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting || usedCount > 0}
        title={usedCount > 0 ? 'Нельзя удалить — использован в заказах' : 'Удалить промокод'}
        className="rounded-lg px-2 py-1 text-xs font-medium text-accent-magenta bg-accent-magenta-dim hover:bg-accent-magenta/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {deleting ? '...' : '✕'}
      </button>
    </div>
  );
}
