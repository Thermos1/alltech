import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Авторизация',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 grid-pattern">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="font-display text-2xl text-accent-yellow neon-yellow">
            АЛТЕХ
          </span>
          <p className="text-text-muted text-xs mt-1">Родом из Якутии</p>
        </Link>
        {children}
      </div>
    </div>
  )
}
