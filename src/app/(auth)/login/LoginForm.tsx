'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || searchParams.get('redirect') || '/cabinet'

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [devCode, setDevCode] = useState<string | null>(null)

  function startCountdown() {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const fullPhone = '+7' + phone.replace(/[\s\-()]/g, '')
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      // Dev mode: show code in UI
      if (data.devCode) {
        setDevCode(data.devCode)
      }

      setStep('code')
      startCountdown()
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const fullPhone = '+7' + phone.replace(/[\s\-()]/g, '')
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      // Exchange token_hash for session
      if (data.token_hash) {
        const supabase = createClient()
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink',
        })

        if (verifyError) {
          setError('Ошибка входа. Попробуйте снова')
          setLoading(false)
          return
        }
      }

      // Hard redirect to ensure SSR picks up the new session
      // Middleware will redirect staff (manager/admin) to /admin
      window.location.href = nextUrl
    } catch {
      setError('Ошибка соединения')
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors'

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-6 glow-border-yellow">
      <h1 className="font-display text-xl text-text-primary text-center mb-2">
        Вход в аккаунт
      </h1>
      <p className="text-text-muted text-sm text-center mb-6">
        {step === 'phone'
          ? 'Введите номер телефона для получения кода'
          : 'Введите код из SMS'}
      </p>

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-text-secondary text-sm font-medium block">
              Номер телефона
            </label>
            <div className="flex">
              <span className="flex items-center bg-bg-secondary border border-r-0 border-border-subtle rounded-l-lg px-3 text-text-muted text-sm font-medium select-none">
                +7
              </span>
              <input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                placeholder="924 171-61-22"
                className={`${inputClass} rounded-l-none`}
              />
            </div>
          </div>

          {error && <p className="text-accent-magenta text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full bg-accent-yellow text-bg-primary font-semibold rounded-lg py-3 px-6 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Отправка...' : 'Получить код'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="bg-bg-secondary rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-text-secondary text-sm">+7 {phone}</span>
            <button
              type="button"
              onClick={() => { setStep('phone'); setCode(''); setError(null); setDevCode(null) }}
              className="text-accent-cyan text-xs hover:text-accent-yellow transition-colors"
            >
              Изменить
            </button>
          </div>

          {devCode && (
            <div className="bg-accent-cyan-dim border border-accent-cyan/20 rounded-lg px-3 py-2 text-center">
              <p className="text-accent-cyan text-xs">
                Dev режим — код: <span className="font-display text-lg">{devCode}</span>
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="code" className="text-text-secondary text-sm font-medium block">
              Код из SMS
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              autoFocus
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className={`${inputClass} text-center text-2xl tracking-[0.5em] font-display`}
            />
          </div>

          {error && <p className="text-accent-magenta text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full bg-accent-yellow text-bg-primary font-semibold rounded-lg py-3 px-6 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>

          <button
            type="button"
            disabled={countdown > 0 || loading}
            onClick={handleSendCode}
            className="w-full text-text-muted text-sm hover:text-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Повторная отправка через ${countdown} сек.` : 'Отправить код повторно'}
          </button>
        </form>
      )}
    </div>
  )
}
