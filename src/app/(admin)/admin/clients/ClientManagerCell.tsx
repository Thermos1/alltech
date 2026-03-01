'use client';

import { useState } from 'react';

interface ClientManagerCellProps {
  clientId: string;
  currentManagerId: string | null;
  managers: { id: string; full_name: string | null }[];
}

export default function ClientManagerCell({
  clientId,
  currentManagerId,
  managers,
}: ClientManagerCellProps) {
  const [managerId, setManagerId] = useState(currentManagerId || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(newManagerId: string) {
    setManagerId(newManagerId);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/assign-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, managerId: newManagerId || null }),
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
    <div className="relative">
      <select
        value={managerId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={`w-full rounded-md border px-2 py-1 text-xs transition-colors focus:outline-none ${
          saved
            ? 'border-green-500/50 bg-green-500/10 text-green-400'
            : 'border-border-subtle bg-bg-secondary text-text-secondary focus:border-accent-yellow'
        } disabled:opacity-50`}
      >
        <option value="">—</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name || m.id.slice(0, 8)}
          </option>
        ))}
      </select>
    </div>
  );
}
