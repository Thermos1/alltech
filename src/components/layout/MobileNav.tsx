'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, useCartHydrated } from '@/stores/cart-store';

const navItems = [
  {
    href: '/',
    label: 'Главная',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/catalog/lubricants',
    label: 'Каталог',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/cart',
    label: 'Корзина',
    isCart: true,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
];

const profileIcon = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function MobileNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const cartHydrated = useCartHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());

  const profileHref = !loading && user ? '/cabinet' : '/login';
  const profileLabel = !loading && user ? 'Профиль' : 'Войти';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-primary/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors',
                isActive
                  ? 'text-accent-yellow'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <span className="relative">
                {item.icon}
                {item.isCart && cartHydrated && itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-yellow px-0.5 text-[8px] font-bold text-bg-primary">
                    {itemCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Profile / Login */}
        <Link
          href={profileHref}
          className={cn(
            'relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors',
            pathname.startsWith('/cabinet') || pathname === '/login'
              ? 'text-accent-yellow'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <span className="relative">{profileIcon}</span>
          <span>{profileLabel}</span>
        </Link>
      </div>
    </nav>
  );
}
