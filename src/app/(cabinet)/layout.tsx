import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MobileNav from '@/components/layout/MobileNav';

const navItems = [
  { href: '/cabinet', label: 'Обзор', icon: '📊' },
  { href: '/cabinet/orders', label: 'Заказы', icon: '📦' },
  { href: '/cabinet/settings', label: 'Настройки', icon: '⚙️' },
];

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/cabinet');
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(0,0,0,0.1)] bg-[#FFD600] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[var(--container-max)] items-center justify-between px-[var(--container-padding)]">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-all-black.png"
              alt="АЛТЕХ"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link
            href="/catalog/lubricants"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            В каталог
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        {/* Tab navigation */}
        <nav className="flex gap-1 overflow-x-auto no-scrollbar border-b border-border-subtle py-3 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Content */}
        <main className="pb-20">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
