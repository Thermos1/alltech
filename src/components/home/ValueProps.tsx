const valueProps = [
  {
    title: 'Бесплатная доставка',
    description: 'Прямо на стоянку, объект или в мастерскую. В черте города.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-yellow"
      >
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    accent: 'text-accent-yellow',
  },
  {
    title: 'Простое оформление',
    description: 'Выбрали, заказали — готово!',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-cyan"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    accent: 'text-accent-cyan',
  },
  {
    title: 'Большой выбор масел',
    description: 'Фильтрация по бренду, типу и объёму.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-magenta"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    accent: 'text-accent-magenta',
  },
];

export default function ValueProps() {
  return (
    <section className="bg-bg-secondary py-10 md:py-14">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {valueProps.map((prop) => (
            <div
              key={prop.title}
              className="flex flex-col items-start gap-3 rounded-xl border border-border-subtle bg-bg-card p-5 md:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-primary">
                {prop.icon}
              </div>
              <div>
                <h3
                  className={`font-display text-sm md:text-base ${prop.accent}`}
                >
                  {prop.title}
                </h3>
                <p className="mt-1 text-sm text-text-muted leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
