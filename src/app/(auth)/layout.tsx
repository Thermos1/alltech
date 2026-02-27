import Link from 'next/link'
import Image from 'next/image'
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
        <Link href="/" className="flex justify-center mb-8">
          <Image
            src="/images/logo-yakutia.png"
            alt="АЛТЕХ — Родом из Якутии"
            width={140}
            height={140}
            className="h-28 w-auto"
            priority
          />
        </Link>
        {children}
      </div>
    </div>
  )
}
