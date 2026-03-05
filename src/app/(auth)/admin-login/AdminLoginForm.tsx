'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setLoading(false)
      if (authError.message.includes('Invalid login credentials')) {
        setError('Неверный email или пароль')
      } else {
        setError(authError.message)
      }
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      await supabase.auth.signOut()
      setLoading(false)
      setError('Доступ запрещён. Эта страница только для сотрудников.')
      return
    }

    // Hard redirect to ensure SSR picks up the new session cookies
    window.location.href = '/admin'
  }

  const inputClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors'

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-6 glow-border-yellow">
      <h1 className="font-display text-xl text-text-primary text-center mb-2">
        Вход для сотрудников
      </h1>
      <p className="text-text-muted text-sm text-center mb-6">
        Панель управления АЛТЕХ
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-text-secondary text-sm font-medium block">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@altehspec.ru"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-text-secondary text-sm font-medium block">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {error && <p className="text-accent-magenta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="w-full bg-accent-yellow text-text-on-accent font-semibold rounded-lg py-3 px-6 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
