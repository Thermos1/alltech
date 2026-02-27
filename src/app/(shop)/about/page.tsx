import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pilot — АЛТЕХ',
  description: 'Пилотная версия интернет-магазина АЛТЕХ',
};

const modules = [
  {
    title: 'Каталог товаров',
    description: 'Категории, фильтры по бренду и вязкости. Карточки товаров с вариантами фасовок и ценами.',
    status: 'live' as const,
  },
  {
    title: 'Корзина',
    description: 'Добавление в один клик, изменение количества, пересчёт итогов. Сохраняется между сессиями.',
    status: 'live' as const,
  },
  {
    title: 'Регистрация и вход',
    description: 'Email + пароль. Защищённые маршруты. Автоматическое создание профиля.',
    status: 'live' as const,
  },
  {
    title: 'Оформление заказа',
    description: 'Заполнение данных, применение промокода и бонусов, подтверждение, демо-оплата.',
    status: 'live' as const,
  },
  {
    title: 'Личный кабинет',
    description: 'История заказов, бонусный баланс, реферальный код, настройки профиля.',
    status: 'live' as const,
  },
  {
    title: 'Бонусная система',
    description: '5% кэшбэк бонусами за покупку. Списание при оформлении (до 30% от суммы). Промокоды.',
    status: 'live' as const,
  },
  {
    title: 'Панель администратора',
    description: 'Просмотр и управление заказами, смена статусов, обзор товаров.',
    status: 'live' as const,
  },
  {
    title: 'Подтверждение email',
    description: 'Верификация почты при регистрации. Отключено в пилоте для удобства тестирования.',
    status: 'next' as const,
  },
  {
    title: 'Интернет-эквайринг (ЮKassa)',
    description: 'Приём платежей картами, СБП, электронными кошельками. Сейчас работает демо-оплата.',
    status: 'next' as const,
  },
  {
    title: 'SIPmind — голосовой AI',
    description: 'Клиент звонит — AI-ассистент принимает, находит товар и оформляет заказ автоматически.',
    status: 'next' as const,
  },
  {
    title: 'WhatsApp-заказы',
    description: 'Оператор или бот формирует заказ в WhatsApp и отправляет ссылку на готовую корзину для оплаты.',
    status: 'next' as const,
  },
];

const stack = [
  { label: 'Фронтенд', value: 'Next.js 16, React 19, TypeScript, Tailwind CSS v4' },
  { label: 'Бэкенд и БД', value: 'Supabase (PostgreSQL), REST API, Row Level Security' },
  { label: 'Авторизация', value: 'Supabase Auth (email/пароль, JWT-токены)' },
  { label: 'Хранилище', value: 'Supabase Storage (изображения товаров, WebP-оптимизация)' },
  { label: 'Хостинг', value: 'TouchDub — VPS + Docker, автодеплой при обновлении кода' },
  { label: 'Оптимизация', value: 'SSR, ленивая загрузка, адаптивные изображения' },
];

function StatusBadge({ status }: { status: 'live' | 'next' }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow/15 px-2.5 py-0.5 text-xs font-medium text-accent-yellow">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
        Работает
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-cyan/15 px-2.5 py-0.5 text-xs font-medium text-accent-cyan">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
      Следующий этап
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <span className="font-mono text-text-primary select-all">{text}</span>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-8 md:py-14">

      {/* Hero — Pilot badge */}
      <section className="mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-5">
          <Image
            src="/images/logo-white-full.png"
            alt="АЛТЕХ"
            width={140}
            height={37}
            className="h-9 w-auto md:h-11"
          />
          <span className="rounded-full bg-accent-magenta/15 border border-accent-magenta/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-magenta">
            Pilot
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-3 leading-tight">
          Интернет-магазин для оптово-розничной торговли ГСМ
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
          Пилотная версия платформы АЛТЕХ. Каталог, корзина, оформление заказа,
          личный кабинет, бонусная программа и панель администратора — всё работает
          и готово к тестированию.
        </p>
      </section>

      {/* Тестовые аккаунты */}
      <section className="mb-10 md:mb-14">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Тестовые аккаунты
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-yellow">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h3 className="text-sm font-semibold text-accent-yellow">Покупатель</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Email:</span>
                <CopyButton text="demo@altech-store.ru" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Пароль:</span>
                <CopyButton text="demo2025" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Каталог, корзина, оформление, личный кабинет, бонусы
            </p>
          </div>

          <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-magenta">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3 className="text-sm font-semibold text-accent-magenta">Администратор</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Email:</span>
                <CopyButton text="admin@altech-store.ru" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Пароль:</span>
                <CopyButton text="admin2025" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Всё вышеперечисленное + панель управления заказами: /admin
            </p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Также можно зарегистрировать новый аккаунт — подтверждение email в пилоте отключено.
        </p>
      </section>

      {/* Модули */}
      <section className="mb-10 md:mb-14">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Модули платформы
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {modules.map((m) => (
            <div
              key={m.title}
              className="rounded-xl border border-border-subtle bg-bg-card p-4 transition-colors hover:border-border-accent"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="text-sm font-semibold text-text-primary">{m.title}</h3>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Перспективные интеграции */}
      <section className="mb-10 md:mb-14">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Перспективные интеграции
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">SIPmind — голосовой AI</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Клиент звонит на номер компании. AI-ассистент принимает звонок, уточняет
              потребность, находит товар в каталоге и оформляет заказ — без участия менеджера.
            </p>
          </div>
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">WhatsApp-заказы</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Клиент пишет в WhatsApp — оператор или бот собирает заказ
              и отправляет ссылку на готовую корзину для оплаты на сайте.
            </p>
          </div>
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">ЮKassa — онлайн-оплата</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Приём платежей банковскими картами, через СБП и электронные кошельки.
              Автоматическое подтверждение через webhook.
            </p>
          </div>
        </div>
      </section>

      {/* Технологический стек */}
      <section className="mb-10 md:mb-14">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Технологический стек
        </h2>
        <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
          {stack.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${
                i !== stack.length - 1 ? 'border-b border-border-subtle' : ''
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-accent-cyan w-32 flex-shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-text-secondary">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ключевые свойства */}
      <section className="mb-10 md:mb-14">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Ключевые свойства
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Мгновенная загрузка', desc: 'Серверный рендеринг — страницы грузятся быстро, критично для мобильных пользователей.' },
            { title: 'Мобильный приоритет', desc: 'Адаптивный интерфейс. Нижняя навигация, крупные кнопки, оптимизация под касания.' },
            { title: 'Масштабируемость', desc: 'Новые категории, бренды, способы оплаты и интеграции — без переписывания кода.' },
            { title: 'Безопасность', desc: 'Row Level Security на уровне базы. Каждый пользователь видит только свои данные.' },
            { title: 'Переносимость', desc: 'Docker-контейнер — можно развернуть на любом хостинге без привязки к платформе.' },
            { title: 'AI-готовность', desc: 'REST API для подключения голосового AI, чат-ботов и других каналов продаж.' },
          ].map((a) => (
            <div key={a.title} className="rounded-xl border border-border-subtle bg-bg-card p-4">
              <h3 className="text-xs font-semibold text-accent-yellow mb-1.5">{a.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6">
        <Link
          href="/catalog/lubricants"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow px-6 py-3 text-sm font-bold text-bg-primary transition-all hover:shadow-[0_0_24px_rgba(255,214,0,0.3)]"
        >
          Открыть каталог
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-yellow hover:text-accent-yellow"
        >
          Войти в аккаунт
        </Link>
      </section>
    </div>
  );
}
