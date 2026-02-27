'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/cabinet'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      if (signInError.message === 'Invalid login credentials') {
        setError('Неверный email или пароль')
      } else if (signInError.message === 'Email not confirmed') {
        setError('Email не подтверждён. Проверьте почту')
      } else {
        setError(signInError.message)
      }
      return
    }

    router.push(nextUrl)
    router.refresh()
  }

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-6 glow-border-yellow">
      <h1 className="font-display text-xl text-text-primary text-center mb-6">
        Вход в аккаунт
      </h1>

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
            placeholder="your@email.com"
            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors"
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
            placeholder="Введите пароль"
            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-accent-magenta text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-yellow text-bg-primary font-semibold rounded-lg py-3 px-6 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p className="text-text-muted text-sm text-center mt-6">
        Нет аккаунта?{' '}
        <Link
          href="/register"
          className="text-accent-cyan hover:text-accent-yellow transition-colors"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
