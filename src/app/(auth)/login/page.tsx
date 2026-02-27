import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Вход — АЛТЕХ',
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
