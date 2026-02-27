'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, company_name, inn')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setCompanyName(data.company_name || '');
        setInn(data.inn || '');
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        company_name: companyName || null,
        inn: inn || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Ошибка сохранения');
    } else {
      setMessage('Сохранено!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  }

  const inputClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-text-primary mb-6">Настройки профиля</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5 space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1.5">ФИО</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Петров"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1.5">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1.5">Компания</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ООО «Компания»"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1.5">ИНН</label>
            <input
              type="text"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              placeholder="1234567890"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'rounded-xl py-3 px-8 text-sm font-semibold transition-all',
              'bg-accent-yellow text-bg-primary hover:brightness-110',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
          {message && (
            <span className={message === 'Сохранено!' ? 'text-accent-cyan text-sm' : 'text-accent-magenta text-sm'}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
