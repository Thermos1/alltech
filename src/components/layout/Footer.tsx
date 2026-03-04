import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-10 md:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & tagline */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-display text-xl tracking-wide text-accent-yellow neon-yellow">
                АЛТЕХ
              </span>
            </Link>
            <p className="text-sm text-text-muted">
              Родом из Якутии. Официальный дистрибьютор смазочных материалов и фильтрующих элементов.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-wider text-text-secondary">
              Навигация
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/catalog/lubricants"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                Смазочные материалы
              </Link>
              <Link
                href="/catalog/filters"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                Фильтрующие элементы
              </Link>
              <Link
                href="/cart"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                Корзина
              </Link>
              <Link
                href="/cabinet"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                Личный кабинет
              </Link>
            </nav>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-wider text-text-secondary">
              Контакты
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="tel:+79969142832"
                className="text-text-muted transition-colors hover:text-accent-yellow"
              >
                +7 (996) 914-28-32 <span className="text-text-muted/60 text-xs">отдел продаж</span>
              </a>
              <a
                href="tel:+79142744420"
                className="text-text-muted transition-colors hover:text-accent-yellow"
              >
                +7 (914) 274-44-20 <span className="text-text-muted/60 text-xs">офис</span>
              </a>
              <a
                href="mailto:Alltech.dv@gmail.com"
                className="text-text-muted transition-colors hover:text-accent-yellow"
              >
                Alltech.dv@gmail.com
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-wider text-text-secondary">
              Мы в сети
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://t.me/alltech14_ykt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-accent-cyan"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </a>
              <a
                href="https://instagram.com/alltech.14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-accent-magenta"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
                Instagram
              </a>
              <a
                href="https://wa.me/79969142832"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-green-400"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Brands */}
        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="mb-3 text-xs text-text-muted">Наши бренды:</p>
          <div className="flex flex-wrap gap-2">
            {['ROLF', 'SINTEC', 'KIXX', 'RhinOIL', 'ХИМАВТО', 'Volga Oil', 'AKross', 'Savtok'].map(
              (brand) => (
                <span
                  key={brand}
                  className="rounded-md border border-border-subtle bg-bg-card px-2.5 py-1 text-xs text-text-secondary"
                >
                  {brand}
                </span>
              )
            )}
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-8 border-t border-border-subtle pt-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            <Link href="/privacy" className="text-[11px] text-text-muted hover:text-accent-cyan transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-[11px] text-text-muted hover:text-accent-cyan transition-colors">
              Пользовательское соглашение
            </Link>
            <Link href="/offer" className="text-[11px] text-text-muted hover:text-accent-cyan transition-colors">
              Публичная оферта
            </Link>
            <Link href="/returns" className="text-[11px] text-text-muted hover:text-accent-cyan transition-colors">
              Возврат и обмен
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-[11px] text-text-muted leading-relaxed">
              <p>ООО &laquo;АЛТЕХ&raquo; &middot; ОГРН 1221400010182 &middot; ИНН 1400013380 &middot; КПП 140001001</p>
              <p>г. Якутск, ул. Лонгинова, 24/6, 2 этаж &middot; Пн&ndash;Пт 09:00&ndash;18:00</p>
            </div>
            <p className="text-[11px] text-text-muted whitespace-nowrap">
              &copy; 2022&ndash;2026 АЛТЕХ
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
            <span>Built by</span>
            <a
              href="https://techdab.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              techdab.net
            </a>
            <span>&middot;</span>
            <span>Powered by</span>
            <a
              href="https://sipmind.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              sipmind.net
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
