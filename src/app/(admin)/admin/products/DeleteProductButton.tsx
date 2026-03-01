'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Удалить «${productName}»?\n\nВсе варианты товара будут удалены.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg px-2 py-1 text-xs font-medium text-accent-magenta bg-accent-magenta-dim hover:bg-accent-magenta/20 transition-colors disabled:opacity-50"
      title="Удалить товар"
    >
      {loading ? '...' : 'Удалить'}
    </button>
  );
}
