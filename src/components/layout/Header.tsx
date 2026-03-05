'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cart-store';

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, isStaff, loading, signOut } = useAuth();
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="mx-auto flex h-14 max-w-[var(--container-max)] items-center justify-between px-[var(--container-padding)] md:h-16">
        {/* Logo + phone */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-dark.png"
              alt="АЛТЕХ"
              width={160}
              height={48}
              className="h-10 w-auto md:h-12"
              priority
            />
          </Link>
          <a
            href="tel:+79969142832"
            className="hidden lg:flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-yellow-text transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            +7 (996) 914-28-32
          </a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/catalog/lubricants"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Каталог
          </Link>
          <Link
            href="/catalog/filters"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Фильтры
          </Link>

        </nav>

        {/* Right side: auth + cart + hamburger */}
        <div className="flex items-center gap-2">
          {/* Auth — desktop only */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {isStaff && (
                    <Link
                      href="/admin"
                      className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent-yellow-text transition-colors hover:bg-bg-card"
                      title="Панель управления"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Панель
                    </Link>
                  )}
                  <Link
                    href="/cabinet"
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-card"
                    aria-label="Кабинет"
                    title="Личный кабинет"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-card"
                    aria-label="Выйти"
                    title="Выйти"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted hover:text-accent-magenta">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-accent-yellow px-4 py-2 text-sm font-semibold text-text-on-accent transition-all hover:brightness-110"
                >
                  Войти
                </Link>
              )}
            </div>
          )}

          {/* Search */}
          {searchOpen ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery('');
                }
              }}
              className="flex items-center"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                autoFocus
                className="w-32 sm:w-48 bg-bg-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-card"
              aria-label="Поиск"
              title="Поиск по каталогу"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-card"
            aria-label="Корзина"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-primary"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-yellow px-1 text-[11px] font-bold text-text-on-accent shadow-lg">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-card md:hidden"
            aria-label="Меню"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-text-primary"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="border-t border-border-subtle bg-bg-primary/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-1 px-[var(--container-padding)] py-3">
            <Link
              href="/catalog/lubricants"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              Смазочные материалы
            </Link>
            <Link
              href="/catalog/filters"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              Фильтрующие элементы
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm text-accent-yellow-text transition-colors hover:bg-bg-card"
                      >
                        Панель управления
                      </Link>
                    )}
                    <Link
                      href="/cabinet"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
                    >
                      Личный кабинет
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        signOut()
                      }}
                      className="rounded-lg px-3 py-2.5 text-left text-sm text-text-muted transition-colors hover:bg-bg-card hover:text-accent-magenta"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-accent-yellow-text transition-colors hover:bg-bg-card hover:text-accent-yellow-text"
                  >
                    Войти
                  </Link>
                )}
              </>
            )}

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              Корзина {mounted && itemCount > 0 && `(${itemCount})`}
            </Link>

            <div className="border-t border-border-subtle mt-1 pt-2">
              <a
                href="tel:+79969142832"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-accent-yellow-text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                +7 (996) 914-28-32
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
