import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLogoutButton from './AdminLogoutButton';

const adminNavItems = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/clients', label: 'Клиенты' },
  { href: '/admin/managers', label: 'Менеджеры' },
  { href: '/admin/commissions', label: 'Комиссии' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/brands', label: 'Бренды' },
  { href: '/admin/categories', label: 'Категории' },
];

const managerNavItems = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/clients', label: 'Мои клиенты' },
  { href: '/admin/commissions', label: 'Комиссии' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin-login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    redirect('/');
  }

  const isAdmin = profile.role === 'admin';
  const navItems = isAdmin ? adminNavItems : managerNavItems;
  const panelTitle = isAdmin ? 'АЛТЕХ Admin' : 'АЛТЕХ Менеджер';

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border-subtle bg-bg-secondary">
        <div className="flex h-14 items-center px-5 border-b border-border-subtle">
          <Link href="/admin" className="font-display text-lg text-accent-yellow neon-yellow">
            {panelTitle}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border-subtle space-y-1">
          <Link
            href="/"
            className="flex items-center rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-accent-cyan transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 shrink-0">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            В магазин
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="font-display text-lg text-accent-yellow neon-yellow">
            {panelTitle}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-text-muted hover:text-accent-cyan transition-colors"
            >
              В магазин
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto no-scrollbar px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60">
        <div className="pt-[7.5rem] md:pt-0">
          <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-6 md:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
