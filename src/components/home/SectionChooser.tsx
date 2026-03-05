import Link from 'next/link';

export default function SectionChooser() {
  return (
    <section className="bg-bg-primary py-8 md:py-12">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
          {/* Lubricants card */}
          <Link
            href="/catalog/lubricants"
            className="group relative flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-bg-card p-6 text-center transition-all duration-300 glow-border-yellow hover:bg-bg-card-hover md:p-8 lg:p-10"
          >
            {/* Oil drop icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow-dim md:h-20 md:w-20">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="text-accent-yellow-text md:h-10 md:w-10"
              >
                <path
                  d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 14.5a3.5 3.5 0 003.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-display text-lg text-text-primary transition-colors group-hover:text-accent-yellow-text md:text-xl">
                Смазочные материалы
              </h3>
              <p className="mt-1.5 text-sm text-text-muted">
                Моторные масла, трансмиссионные жидкости, антифризы
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs text-accent-yellow-text opacity-0 transition-opacity group-hover:opacity-100">
              Перейти
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>

          {/* Filters card */}
          <Link
            href="/catalog/filters"
            className="group relative flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-bg-card p-6 text-center transition-all duration-300 glow-border-yellow hover:bg-bg-card-hover md:p-8 lg:p-10"
          >
            {/* Filter icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-dim md:h-20 md:w-20">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="text-accent-cyan md:h-10 md:w-10"
              >
                <path
                  d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-display text-lg text-text-primary transition-colors group-hover:text-accent-cyan md:text-xl">
                Фильтрующие элементы
              </h3>
              <p className="mt-1.5 text-sm text-text-muted">
                Масляные, воздушные, топливные и салонные фильтры
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs text-accent-cyan opacity-0 transition-opacity group-hover:opacity-100">
              Перейти
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
