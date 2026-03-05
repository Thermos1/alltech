'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          ...(refCode ? { referral_code: refCode } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setLoading(false)
      if (signUpError.message.includes('already registered')) {
        setError('Пользователь с таким email уже зарегистрирован')
      } else {
        setError(signUpError.message)
      }
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/10 border-2 border-accent-cyan flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-lg text-text-primary mb-2">
          Проверьте email
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Мы отправили письмо для подтверждения на{' '}
          <span className="text-accent-cyan">{email}</span>.
          Перейдите по ссылке в письме для активации аккаунта.
        </p>
        <Link href="/login" className="text-accent-cyan hover:text-accent-yellow-text transition-colors text-sm">
          Вернуться к входу
        </Link>
      </div>
    )
  }

  const inputClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors'

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-6 glow-border-yellow">
      <h1 className="font-display text-xl text-text-primary text-center mb-6">
        Регистрация
      </h1>

      {refCode && (
        <div className="mb-4 bg-accent-cyan-dim border border-accent-cyan/20 rounded-lg px-3 py-2 text-center">
          <p className="text-accent-cyan text-xs">
            Реферальный код: <span className="font-semibold">{refCode}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-text-secondary text-sm font-medium block">ФИО</label>
          <input id="fullName" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иванов Иван Иванович" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-text-secondary text-sm font-medium block">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-text-secondary text-sm font-medium block">Телефон</label>
          <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-text-secondary text-sm font-medium block">Пароль</label>
          <input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Не менее 6 символов" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-text-secondary text-sm font-medium block">Подтвердите пароль</label>
          <input id="confirmPassword" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" className={inputClass} />
        </div>

        {error && <p className="text-accent-magenta text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-accent-yellow text-text-on-accent font-semibold rounded-lg py-3 px-6 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-text-muted text-sm text-center mt-6">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-accent-cyan hover:text-accent-yellow-text transition-colors">Войти</Link>
      </p>
    </div>
  )
}
