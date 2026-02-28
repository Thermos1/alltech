'use client';

import { useState } from 'react';

interface AssignManagerFormProps {
  clientId: string;
  currentManagerId: string | null;
  managers: { id: string; full_name: string | null }[];
}

export default function AssignManagerForm({
  clientId,
  currentManagerId,
  managers,
}: AssignManagerFormProps) {
  const [managerId, setManagerId] = useState(currentManagerId || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/assign-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, managerId: managerId || null }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={managerId}
        onChange={(e) => setManagerId(e.target.value)}
        className="rounded-lg bg-bg-card border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
      >
        <option value="">Без менеджера</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name || m.id.slice(0, 8)}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-accent-yellow text-bg-primary hover:brightness-110'
        } disabled:opacity-50`}
      >
        {saved ? 'Сохранено' : saving ? '...' : 'Назначить'}
      </button>
    </div>
  );
}
