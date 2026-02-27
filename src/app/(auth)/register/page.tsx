import { Suspense } from 'react'
import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Регистрация — АЛТЕХ',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
