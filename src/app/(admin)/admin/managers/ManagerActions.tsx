'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ManagerActionsProps =
  | {
      type: 'promote';
      customers: { id: string; label: string }[];
      managerId?: never;
      currentRate?: never;
      managerName?: never;
    }
  | {
      type: 'demote';
      managerId: string;
      managerName: string;
      customers?: never;
      currentRate?: never;
    }
  | {
      type: 'commission';
      managerId: string;
      currentRate: number;
      customers?: never;
      managerName?: never;
    };

export default function ManagerActions(props: ManagerActionsProps) {
  const router = useRouter();

  if (props.type === 'promote') return <PromoteForm customers={props.customers} />;
  if (props.type === 'demote') return <DemoteButton managerId={props.managerId} managerName={props.managerName} />;
  return <CommissionEditor managerId={props.managerId} currentRate={props.currentRate} />;
}

function PromoteForm({ customers }: { customers: { id: string; label: string }[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [rate, setRate] = useState('3');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePromote() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedId,
          newRole: 'manager',
          commissionRate: Number(rate),
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          router.refresh();
          setDone(false);
          setSelectedId('');
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
      >
        <option value="">Выберите клиента...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <label className="text-text-muted text-xs whitespace-nowrap">Комиссия %</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          min={0}
          max={100}
          step={0.5}
          className="w-16 rounded-lg bg-bg-secondary border border-border-subtle px-2 py-2 text-sm text-text-primary text-center focus:border-accent-yellow focus:outline-none"
        />
      </div>
      <button
        onClick={handlePromote}
        disabled={!selectedId || loading}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
          done
            ? 'bg-green-500 text-white'
            : 'bg-accent-yellow text-bg-primary hover:brightness-110'
        } disabled:opacity-50`}
      >
        {done ? 'Назначен!' : loading ? '...' : 'Назначить менеджером'}
      </button>
    </div>
  );
}

function DemoteButton({ managerId, managerName }: { managerId: string; managerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDemote() {
    if (!confirm(`Снять ${managerName} с должности менеджера?\n\nВсе его клиенты будут откреплены.`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: managerId, newRole: 'customer' }),
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
      onClick={handleDemote}
      disabled={loading}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent-magenta bg-accent-magenta-dim hover:bg-accent-magenta/20 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Снять'}
    </button>
  );
}

function CommissionEditor({ managerId, currentRate }: { managerId: string; currentRate: number }) {
  const [rate, setRate] = useState(String(currentRate));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const changed = Number(rate) !== currentRate;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId, rate: Number(rate) }),
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
    <div className="flex items-center justify-center gap-1">
      <input
        type="number"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        min={0}
        max={100}
        step={0.5}
        className="w-14 rounded-md bg-bg-secondary border border-border-subtle px-1.5 py-1 text-xs text-text-primary text-center focus:border-accent-yellow focus:outline-none"
      />
      {changed && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-accent-cyan text-bg-primary hover:brightness-110'
          } disabled:opacity-50`}
        >
          {saved ? '!' : saving ? '..' : 'OK'}
        </button>
      )}
    </div>
  );
}
