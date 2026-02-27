'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="mx-auto flex h-14 max-w-[var(--container-max)] items-center justify-between px-[var(--container-padding)] md:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-wide text-accent-yellow neon-yellow md:text-2xl">
            АЛТЕХ
          </span>
          <span className="hidden text-xs text-text-muted sm:inline">
            Родом из Якутии
          </span>
        </Link>

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
          <Link
            href="/cabinet"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Кабинет
          </Link>
        </nav>

        {/* Right side: cart + hamburger */}
        <div className="flex items-center gap-3">
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
            {/* Badge - shown via JS when cart has items; static placeholder */}
            <span
              id="cart-badge"
              className="absolute -right-0.5 -top-0.5 hidden h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-yellow px-1 text-[10px] font-bold text-bg-primary"
            >
              0
            </span>
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
            <Link
              href="/cabinet"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              Личный кабинет
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              Корзина
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
