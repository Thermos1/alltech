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
    description: 'Категоризация по типам ГСМ, фильтры по бренду и вязкости. Карточки с допусками, вариантами фасовок и ценами. Розлив масла с шагом 5 литров.',
    status: 'live' as const,
  },
  {
    title: 'Поиск по каталогу',
    description: 'Мгновенный поиск по названию, бренду, вязкости и допускам. Доступен из шапки на любой странице.',
    status: 'live' as const,
  },
  {
    title: 'Корзина и повтор заказа',
    description: 'Добавление в один клик, редактирование количества, автопересчёт. Повтор предыдущего заказа одной кнопкой. Персистентное хранение.',
    status: 'live' as const,
  },
  {
    title: 'SMS-авторизация',
    description: 'Вход и регистрация клиентов по номеру телефона + SMS-код. Отдельный вход для сотрудников по email/паролю (/admin-login).',
    status: 'live' as const,
  },
  {
    title: 'Оформление заказа',
    description: 'Форма с валидацией, применение промокодов и бонусов, расчёт итога, инициация оплаты.',
    status: 'live' as const,
  },
  {
    title: 'Личный кабинет',
    description: 'История заказов со статусами, бонусный уровень с прогресс-баром, реферальный код, повтор заказа, профиль.',
    status: 'live' as const,
  },
  {
    title: 'Тиерная бонусная программа',
    description: 'Растущий кэшбэк: Старт 3% → Бронза 5% → Серебро 7% → Золото 10% → Платина 15%. Уровень растёт с накоплением покупок.',
    status: 'live' as const,
  },
  {
    title: 'Промокоды',
    description: 'Процентные и фиксированные скидки. Контроль сроков, лимитов использования и минимальной суммы.',
    status: 'live' as const,
  },
  {
    title: 'Мини-CRM для менеджеров',
    description: 'Привязка клиентов к менеджерам, автоматическая комиссия 3% с продаж. Прогноз замены масла (4 мес.), блок «Требуют внимания» с просроченными и предстоящими заменами. WhatsApp-связь с клиентом.',
    status: 'live' as const,
  },
  {
    title: 'Панель администратора',
    description: 'Две роли: Админ видит всё, Менеджер — только своих клиентов. Управление заказами, назначение менеджеров, смена статусов, настройка комиссий.',
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
  { label: 'Фронтенд', value: 'Next.js 16, React 19, TypeScript 5 (strict mode), Tailwind CSS 4' },
  { label: 'Бэкенд и БД', value: 'Supabase PostgreSQL 15, PostgREST, Row Level Security, SECURITY DEFINER functions' },
  { label: 'Авторизация', value: 'Кастомный OTP через SMS.ru + Supabase Auth — JWT, refresh-токены, HttpOnly cookie-сессии' },
  { label: 'Безопасность', value: 'RLS на всех таблицах, Zod-валидация входных данных, CORS, CSP, TLS/SSL, rate limiting OTP' },
  { label: 'Хранилище', value: 'Supabase Storage CDN, оптимизация изображений через next/image (WebP, AVIF)' },
  { label: 'Тестирование', value: 'Vitest — 138 unit-тестов, 100% покрытие критических путей (оплата, авторизация, CRM, API)' },
  { label: 'Валидация', value: 'Zod v4 — сквозная типизация: одна схема для клиента (UX) и сервера (безопасность)' },
  { label: 'Состояние', value: 'Zustand 5 — изоморфное состояние с localStorage-персистентностью и SSR hydration guard' },
  { label: 'Инфраструктура', value: 'Docker standalone, GitHub Actions CI/CD, zero-downtime deploy через Coolify REST API' },
  { label: 'Мониторинг', value: 'Структурное логирование, graceful degradation, fail-open архитектура' },
];

const architecture = [
  {
    title: 'Server Components + Streaming',
    desc: 'React Server Components для zero-bundle серверной логики. Streaming SSR с Suspense. TTFB < 200ms на статике.',
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
    desc: 'Безопасность на уровне PostgreSQL. SECURITY DEFINER функции для ролевой модели. Три уровня клиентов: anon, authenticated, service_role.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Горизонтальное масштабирование',
    desc: 'Stateless-архитектура с cookie-сессиями. Контейнеризация через Docker. Несколько инстансов за балансировщиком без изменения кода.',
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
    desc: '138 автоматизированных тестов в 13 test suites. CI-пайплайн: линтер → type-check → тесты → билд → деплой. Каждый коммит проверяется автоматически.',
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

      {/* Метрики качества */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Метрики качества
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '138', label: 'автоматизированных тестов', sub: '13 test suites' },
            { value: '0', label: 'ошибок TypeScript', sub: 'strict mode' },
            { value: '< 1 мин', label: 'CI/CD пайплайн', sub: 'push → deploy' },
            { value: '100%', label: 'покрытие критических путей', sub: 'оплата, auth, CRM' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5 text-center">
              <p className="font-display text-2xl text-accent-yellow">{m.value}</p>
              <p className="text-xs text-text-primary mt-1">{m.label}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Принципы разработки */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Принципы разработки
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Type Safety',
              desc: 'TypeScript strict mode + Zod v4 runtime-валидация. Типизация сквозная: от формы до базы данных. Ни одного any.',
            },
            {
              title: 'Security by Design',
              desc: 'RLS с SECURITY DEFINER функциями, RBAC (admin/manager/customer), rate limiting, HttpOnly cookies, input sanitization.',
            },
            {
              title: 'Test-Driven Quality',
              desc: 'Каждый API-эндпоинт покрыт тестами. Мок-изоляция без внешних зависимостей. Regression-тест на каждый баг.',
            },
            {
              title: 'Zero-Downtime Deploy',
              desc: 'Docker-контейнеры с health checks. GitHub Actions запускает тесты, билд и деплой атомарно через Coolify API.',
            },
            {
              title: 'Fail-Open Architecture',
              desc: 'Внешний сервис недоступен — платформа работает. Graceful degradation для SMS, платежей, интеграций.',
            },
            {
              title: 'Code Review Culture',
              desc: 'Каждое изменение проходит линтер (ESLint), форматтер, type-check, полный прогон тестов. Коммит без прохождения CI невозможен.',
            },
          ].map((p) => (
            <div key={p.title} className="rounded-xl border border-border-subtle bg-bg-card p-4">
              <h3 className="text-xs font-semibold text-accent-yellow mb-1.5">{p.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Паттерны */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Архитектурные паттерны
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Server Components + Client Islands',
              desc: 'Серверные компоненты для данных, клиентские — только для интерактива. Минимальный JS-бандл на клиенте.',
            },
            {
              title: 'Route Groups + Isolated Layouts',
              desc: '(shop), (cabinet), (admin), (auth) — четыре изолированных модуля со своими layouts, middleware и навигацией.',
            },
            {
              title: 'Three-Tier DB Access',
              desc: 'Anon (каталог), Server (сессия пользователя), Admin (service_role). RLS-политики адаптируются под каждый уровень.',
            },
            {
              title: 'Сквозная Zod-валидация',
              desc: 'Одна Zod-схема валидирует на клиенте (мгновенный UX-фидбек) и на сервере (защита от injection).',
            },
            {
              title: 'Persist + Hydration Guard',
              desc: 'Zustand c localStorage-персистентностью. mounted-флаг предотвращает SSR/CSR mismatch при гидратации.',
            },
            {
              title: 'Feature-Based Route Handlers',
              desc: 'Каждый эндпоинт — изолированный route handler. Независимое тестирование, версионирование, документация.',
            },
          ].map((p) => (
            <div key={p.title} className="rounded-xl border border-border-subtle bg-bg-card p-4">
              <h3 className="text-xs font-semibold text-accent-yellow mb-1.5">{p.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как смотреть */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Как смотреть — пошаговый маршрут
        </h2>
        <p className="text-text-secondary text-sm mb-6 max-w-2xl">
          Рекомендуемый порядок для ознакомления с платформой. Каждый шаг показывает конкретную функцию.
        </p>
        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Каталог и карточки товаров',
              action: 'Откройте каталог, выберите категорию (например, «Моторные масла»). Нажмите на карточку — откроется попап с вариантами фасовок и ценами. Попробуйте розлив: двигайте ползунок для объёма.',
              link: '/catalog/lubricants',
              linkLabel: 'Открыть каталог',
            },
            {
              step: '2',
              title: 'Корзина и оформление заказа',
              action: 'Добавьте пару товаров в корзину. Перейдите в корзину — измените количество, удалите позицию. Нажмите «Оформить» — заполните форму (имя, телефон, адрес). Примените промокод ALTECH10. Пройдите демо-оплату.',
              link: '/cart',
              linkLabel: 'Открыть корзину',
            },
            {
              step: '3',
              title: 'Регистрация покупателя',
              action: 'Нажмите «Войти». Введите любой номер телефона — в тестовом режиме SMS-код отображается на экране. После входа откроется личный кабинет.',
              link: '/login',
              linkLabel: 'Войти / Зарегистрироваться',
            },
            {
              step: '4',
              title: 'Личный кабинет покупателя',
              action: 'После оформления заказа зайдите в кабинет. Посмотрите историю заказов, бонусный уровень, реферальный код. Откройте детали заказа — внизу кнопка «Повторить заказ».',
              link: '/cabinet',
              linkLabel: 'Личный кабинет',
            },
            {
              step: '5',
              title: 'Панель менеджера',
              action: 'Войдите как менеджер (через /admin-login). На дашборде — заказы привязанных клиентов, комиссия, блок «Требуют внимания» с прогнозом замены масла. Откройте карточку клиента — история покупок, прогноз, кнопка WhatsApp.',
              link: '/admin-login',
              linkLabel: 'Вход для сотрудников',
            },
            {
              step: '6',
              title: 'Панель администратора',
              action: 'Войдите как админ (через /admin-login). Дашборд: все заказы, выручка, клиенты без менеджера. Откройте «Клиенты» — назначьте менеджера. Откройте заказ — смените статус.',
              link: '/admin-login',
              linkLabel: 'Вход для сотрудников',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border-subtle bg-bg-card p-4 md:p-5"
            >
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-yellow/15 text-accent-yellow font-display text-sm">
                  {item.step}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">{item.action}</p>
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-yellow transition-colors"
                  >
                    {item.linkLabel}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Тестовые аккаунты */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Тестовые аккаунты
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
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
                <span className="text-text-muted">Телефон:</span>
                <CopyButton text="+7 900 111-11-11" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Каталог, корзина, оформление, кабинет, бонусы, повтор заказа
            </p>
            <div className="mt-2 text-[11px] space-y-0.5">
              <span className="text-text-muted">Вход → </span>
              <CopyButton text="/login" />
              <span className="text-text-muted"> | Кабинет → </span>
              <CopyButton text="/cabinet" />
            </div>
          </div>

          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <h3 className="text-sm font-semibold text-accent-cyan">Менеджер</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Email:</span>
                <CopyButton text="manager@altech-store.ru" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Пароль:</span>
                <CopyButton text="manager2025" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              CRM: свои клиенты, их заказы, комиссия, прогноз замены масла
            </p>
            <div className="mt-2 text-[11px] space-y-0.5">
              <span className="text-text-muted">Вход → </span>
              <CopyButton text="/admin-login" />
              <span className="text-text-muted"> | Панель → </span>
              <CopyButton text="/admin" />
            </div>
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
              Полный доступ: заказы, клиенты, назначение менеджеров, статусы
            </p>
            <div className="mt-2 text-[11px] space-y-0.5">
              <span className="text-text-muted">Вход → </span>
              <CopyButton text="/admin-login" />
              <span className="text-text-muted"> | Панель → </span>
              <CopyButton text="/admin" />
            </div>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Покупатели — вход по SMS-коду (в тестовом режиме код отображается на экране).
          Сотрудники — вход по email/паролю через <span className="text-text-secondary">/admin-login</span>.
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
