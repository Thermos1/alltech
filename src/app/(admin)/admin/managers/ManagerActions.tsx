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
      otherManagers?: never;
      clientCount?: never;
    }
  | {
      type: 'demote';
      managerId: string;
      managerName: string;
      otherManagers: { id: string; full_name: string | null }[];
      clientCount: number;
      customers?: never;
      currentRate?: never;
    }
  | {
      type: 'commission';
      managerId: string;
      currentRate: number;
      customers?: never;
      managerName?: never;
      otherManagers?: never;
      clientCount?: never;
    };

export default function ManagerActions(props: ManagerActionsProps) {
  if (props.type === 'promote') return <PromoteForm customers={props.customers} />;
  if (props.type === 'demote') return <DemoteButton managerId={props.managerId} managerName={props.managerName} otherManagers={props.otherManagers} clientCount={props.clientCount} />;
  return <CommissionEditor managerId={props.managerId} currentRate={props.currentRate} />;
}

function PromoteForm({ customers }: { customers: { id: string; label: string }[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [rate, setRate] = useState('3');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handlePromote() {
    if (!selectedId || !email || !password) return;
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedId,
          newRole: 'manager',
          commissionRate: Number(rate),
          email,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          router.refresh();
          setDone(false);
          setSelectedId('');
          setEmail('');
          setPassword('');
        }, 1000);
      } else {
        setError(data.error || 'Ошибка');
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={`flex-1 ${inputClass}`}
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
            className={`w-16 text-center ${inputClass}`}
          />
        </div>
      </div>
      {selectedId && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email для входа в панель"
            className={`flex-1 ${inputClass}`}
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className={`sm:w-40 ${inputClass}`}
          />
          <button
            onClick={handlePromote}
            disabled={!email || !password || loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              done
                ? 'bg-green-500 text-white'
                : 'bg-accent-yellow text-bg-primary hover:brightness-110'
            } disabled:opacity-50`}
          >
            {done ? 'Назначен!' : loading ? '...' : 'Назначить менеджером'}
          </button>
        </div>
      )}
      {error && <p className="text-accent-magenta text-xs">{error}</p>}
    </div>
  );
}

function DemoteButton({
  managerId,
  managerName,
  otherManagers,
  clientCount,
}: {
  managerId: string;
  managerName: string;
  otherManagers: { id: string; full_name: string | null }[];
  clientCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDemote() {
    const action = clientCount > 0 && !transferTo
      ? 'Клиенты будут откреплены (без менеджера).'
      : clientCount > 0
        ? `Клиенты будут переданы другому менеджеру.`
        : '';

    if (!confirm(`Снять ${managerName} с должности менеджера?\n\n${action}`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: managerId,
          newRole: 'customer',
          transferTo: transferTo || null,
        }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent-magenta bg-accent-magenta-dim hover:bg-accent-magenta/20 transition-colors"
      >
        Снять
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      {clientCount > 0 && (
        <select
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          className="rounded-md bg-bg-secondary border border-border-subtle px-2 py-1.5 text-xs text-text-primary focus:border-accent-yellow focus:outline-none"
        >
          <option value="">Открепить клиентов</option>
          {otherManagers.map((m) => (
            <option key={m.id} value={m.id}>
              Передать → {m.full_name || m.id.slice(0, 8)}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-1">
        <button
          onClick={handleDemote}
          disabled={loading}
          className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-white bg-accent-magenta hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Подтвердить'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1.5 text-xs font-medium text-text-muted bg-bg-secondary hover:text-text-primary transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
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
