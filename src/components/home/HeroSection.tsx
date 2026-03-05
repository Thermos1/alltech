import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-bg-primary">
      {/* Background effects */}
      <div className="grid-pattern scan-lines absolute inset-0" />

      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 214, 0, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-8 md:py-12 lg:py-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:max-w-2xl">
          {/* Heading */}
          <h1 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="text-accent-yellow-text neon-yellow">
              Подберите масло
            </span>
            <br />
            <span className="text-text-primary">
              и оформите заказ за 5 кликов
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 max-w-lg text-base text-text-secondary sm:text-lg md:mt-6">
            Все необходимое на одной странице — удобно, быстро, профессионально.
          </p>

          {/* CTA button */}
          <Link
            href="/catalog/lubricants"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-yellow px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-text-on-accent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] hover:scale-105 md:mt-10 md:px-8 md:py-3.5 md:text-base"
          >
            Перейти в каталог
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
