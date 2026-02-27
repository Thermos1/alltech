import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'О платформе — АЛТЕХ',
  description: 'Заказная разработка интернет-магазина АЛТЕХ. Архитектура, стек, масштабируемость.',
};

const modules = [
  {
    title: 'Каталог товаров',
    description: 'Категоризация по типам ГСМ, фильтры по бренду и вязкости. Карточки с вариантами фасовок, ценами и изображениями.',
    status: 'live' as const,
  },
  {
    title: 'Корзина',
    description: 'Добавление в один клик, редактирование количества, автопересчёт. Персистентное хранение между сессиями.',
    status: 'live' as const,
  },
  {
    title: 'Авторизация',
    description: 'Регистрация и вход по email. Защищённые маршруты, JWT-сессии, автоматическое создание профиля.',
    status: 'live' as const,
  },
  {
    title: 'Оформление заказа',
    description: 'Форма с валидацией, применение промокодов и бонусов, расчёт итога, инициация оплаты.',
    status: 'live' as const,
  },
  {
    title: 'Личный кабинет',
    description: 'История заказов со статусами, бонусный баланс, реферальный код, редактирование профиля.',
    status: 'live' as const,
  },
  {
    title: 'Бонусная программа',
    description: 'Кэшбэк 5% бонусами за каждую покупку. Списание при оформлении (до 30% от суммы). Реферальная программа.',
    status: 'live' as const,
  },
  {
    title: 'Промокоды',
    description: 'Процентные и фиксированные скидки. Контроль сроков, лимитов использования и минимальной суммы.',
    status: 'live' as const,
  },
  {
    title: 'Панель администратора',
    description: 'Управление заказами, смена статусов, просмотр каталога. Ролевой доступ с RLS-политиками.',
    status: 'live' as const,
  },
  {
    title: 'REST API для интеграций',
    description: 'Готовые эндпоинты для внешних систем: поиск товаров, проверка остатков, создание заказов. Bearer-авторизация.',
    status: 'live' as const,
  },
  {
    title: 'Интернет-эквайринг (ЮKassa)',
    description: 'Приём платежей картами, СБП, электронными кошельками. Сейчас работает демо-оплата с полным flow.',
    status: 'next' as const,
  },
  {
    title: 'SIPmind — голосовой AI',
    description: 'Клиент звонит — AI-ассистент принимает, находит товар и оформляет заказ автоматически через API.',
    status: 'next' as const,
  },
  {
    title: 'WhatsApp-заказы',
    description: 'Оператор или бот формирует заказ в мессенджере и отправляет ссылку на готовую корзину.',
    status: 'next' as const,
  },
];

const stack = [
  { label: 'Фронтенд', value: 'Next.js 16, React 19, TypeScript 5, Tailwind CSS 4' },
  { label: 'Бэкенд и БД', value: 'Supabase (PostgreSQL 15), REST API, Row Level Security' },
  { label: 'Авторизация', value: 'Supabase Auth — JWT-токены, refresh, cookie-сессии' },
  { label: 'Хранилище', value: 'Supabase Storage — CDN, оптимизация изображений через next/image' },
  { label: 'Тестирование', value: 'Vitest, React Testing Library — unit и интеграционные тесты' },
  { label: 'Валидация', value: 'Zod — строгая типизация входных данных на клиенте и сервере' },
  { label: 'Состояние', value: 'Zustand 5 — глобальное состояние с персистентностью' },
  { label: 'Инфраструктура', value: 'Docker, CI/CD (GitHub Actions), автодеплой при обновлении кода' },
];

const architecture = [
  {
    title: 'Server-Side Rendering',
    desc: 'Страницы рендерятся на сервере — мгновенная загрузка, SEO-индексация, низкий Time to First Byte.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Row Level Security',
    desc: 'Безопасность на уровне базы данных. Каждый пользователь видит только свои данные — невозможно обойти.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Горизонтальное масштабирование',
    desc: 'Stateless-архитектура. Можно развернуть несколько инстансов за балансировщиком при росте нагрузки.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="12" x2="2" y2="12" />
        <polyline points="15 5 22 12 15 19" />
        <polyline points="9 19 2 12 9 5" />
      </svg>
    ),
  },
  {
    title: 'Покрытие тестами',
    desc: 'Критическая бизнес-логика покрыта unit-тестами: оплата, бонусы, валидация, корзина, API.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'Мобильный приоритет',
    desc: 'Адаптивный интерфейс с mobile-first подходом. Оптимизирован под касания, нижняя навигация на мобильных.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'API-first',
    desc: 'REST API для любых каналов продаж: голосовой AI, мессенджеры, мобильное приложение, внешние системы.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
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

      {/* Hero */}
      <section className="mb-12 md:mb-16">
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
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-text-primary mb-4 leading-tight">
          Цифровая платформа для оптово-розничной<br className="hidden md:block" /> торговли ГСМ
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
          Заказная разработка полного цикла: от каталога до управления заказами.
          Построена на промышленном стеке с фокусом на масштабируемость,
          безопасность и интеграцию с внешними системами.
        </p>
      </section>

      {/* Архитектура и гарантии */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Архитектура и гарантии
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {architecture.map((a) => (
            <div key={a.title} className="rounded-xl border border-border-subtle bg-bg-card p-5 transition-colors hover:border-accent-yellow/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-yellow/10 text-accent-yellow">
                  {a.icon}
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{a.title}</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Модули платформы */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Модули платформы
        </h2>
        <p className="text-text-secondary text-sm mb-6 max-w-2xl">
          Каждый модуль — самостоятельная единица, которую можно развивать независимо.
          Архитектура позволяет добавлять новые модули без переписывания существующих.
        </p>
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

      {/* Масштабирование */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Возможности масштабирования
        </h2>
        <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Мобильное приложение</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                API-first архитектура позволяет подключить нативное iOS/Android приложение
                к тому же бэкенду. Единая база данных, единая бизнес-логика.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Мультирегиональность</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Расширение на другие регионы через дополнительные склады, ценовые матрицы
                и локальные каталоги — без изменения ядра платформы.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Каналы продаж</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Веб-сайт, голосовой AI, WhatsApp, Telegram-бот, мобильное приложение —
                все каналы работают через один API и одну базу данных.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ближайшие интеграции */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Ближайшие интеграции
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">SIPmind — голосовой AI</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Клиент звонит на номер компании. AI-ассистент принимает звонок, уточняет
              потребность, находит товар в каталоге и оформляет заказ — без участия менеджера.
            </p>
            <p className="text-[10px] text-accent-cyan mt-2 font-medium">Бесплатно в рамках пилота</p>
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

      {/* Дополнительные интеграции */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Перспективные интеграции
        </h2>
        <p className="text-xs text-text-secondary mb-4 max-w-2xl">
          Не входят в текущий объём разработки. Могут быть реализованы в рамках
          отдельного этапа по мере необходимости бизнеса.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: '1С', desc: 'Двусторонняя синхронизация остатков, цен и заказов с учётной системой' },
            { name: 'AmoCRM', desc: 'Управление клиентской базой, воронки продаж, аналитика конверсий' },
            { name: 'Битрикс24', desc: 'CRM, внутренние задачи, коммуникации, автоматизация процессов' },
            { name: 'МойСклад', desc: 'Складской учёт, приход/расход, инвентаризация, документооборот' },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-border-subtle bg-bg-card p-4">
              <h3 className="text-xs font-semibold text-text-primary mb-1">{item.name}</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Технологический стек */}
      <section className="mb-12 md:mb-16">
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
              <span className="text-xs font-medium uppercase tracking-wider text-accent-cyan w-36 flex-shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-text-secondary">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Паттерны */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Архитектурные паттерны
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Server Components + Client Islands',
              desc: 'Серверные компоненты для данных, клиентские — только для интерактива. Минимальный JS-бандл.',
            },
            {
              title: 'Модульная маршрутизация',
              desc: 'Route groups: (shop), (cabinet), (admin), (auth). Каждый модуль — изолированный layout и middleware.',
            },
            {
              title: 'Admin Client / Server Client / Service Role',
              desc: 'Три уровня доступа к БД: анонимный, авторизованный, сервисный. RLS на каждом уровне.',
            },
            {
              title: 'Zod-валидация на обоих концах',
              desc: 'Одна Zod-схема валидирует и на клиенте (мгновенный UX), и на сервере (безопасность).',
            },
            {
              title: 'Persist + Hydration pattern',
              desc: 'Zustand с localStorage-персистентностью и защитой от SSR-гидратации для корзины.',
            },
            {
              title: 'Feature-based API',
              desc: 'Каждый эндпоинт — отдельный route handler. Легко тестировать, документировать и версионировать.',
            },
          ].map((p) => (
            <div key={p.title} className="rounded-xl border border-border-subtle bg-bg-card p-4">
              <h3 className="text-xs font-semibold text-accent-yellow mb-1.5">{p.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Тестовые аккаунты */}
      <section className="mb-12 md:mb-16">
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
              Полный доступ + панель управления заказами: /admin
            </p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Также можно зарегистрировать новый аккаунт — подтверждение email в пилоте отключено.
        </p>
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

      {/* Footer credits */}
      <div className="border-t border-border-subtle mt-4 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-[10px] text-text-muted">
        <span>
          Built by{' '}
          <a href="https://techdab.net" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-yellow transition-colors">
            techdab.net
          </a>
        </span>
        <span className="hidden sm:inline">&middot;</span>
        <span>
          Powered by{' '}
          <a href="https://sipmind.net" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-yellow transition-colors">
            sipmind.net
          </a>
        </span>
      </div>
    </div>
  );
}
