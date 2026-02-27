import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'О платформе — АЛТЕХ',
  description: 'Техническое описание платформы интернет-магазина АЛТЕХ',
};

const modules = [
  {
    title: 'Каталог товаров',
    description: 'Структурированный каталог с категориями, фильтрами по бренду и вязкости. Карточки товаров с вариантами фасовок и ценами.',
    status: 'live' as const,
  },
  {
    title: 'Корзина',
    description: 'Добавление товаров в один клик, изменение количества, автоматический пересчёт. Сохранение между сессиями.',
    status: 'live' as const,
  },
  {
    title: 'Оформление заказа',
    description: 'Полный цикл: заполнение данных, применение промокода и бонусов, подтверждение, оплата.',
    status: 'live' as const,
  },
  {
    title: 'Авторизация',
    description: 'Регистрация и вход по email. Защищённые маршруты. Безопасное хранение данных.',
    status: 'live' as const,
  },
  {
    title: 'Личный кабинет',
    description: 'История заказов, бонусный баланс, реферальный код «Приведи друга», настройки профиля.',
    status: 'live' as const,
  },
  {
    title: 'Бонусная система',
    description: '5% кэшбэк бонусами за каждую покупку. Списание бонусов при оформлении (до 30% от суммы). Промокоды.',
    status: 'live' as const,
  },
  {
    title: 'Панель администратора',
    description: 'Просмотр и управление заказами, смена статусов, обзор товаров. Доступ по ролям.',
    status: 'live' as const,
  },
  {
    title: 'Интернет-эквайринг (ЮKassa)',
    description: 'Приём онлайн-платежей картами, СБП, электронными кошельками. Автоматическое подтверждение оплаты.',
    status: 'next' as const,
  },
  {
    title: 'SIPmind — голосовой AI',
    description: 'Интеграция с голосовым AI-ассистентом. Клиент звонит, называет нужный товар — AI находит в каталоге и оформляет заказ через API магазина.',
    status: 'next' as const,
  },
  {
    title: 'WhatsApp-заказы',
    description: 'Клиент пишет в WhatsApp, оператор или бот формирует заказ и отправляет персональную ссылку на корзину с предзаполненными товарами для оплаты на сайте.',
    status: 'next' as const,
  },
];

const stack = [
  { label: 'Фронтенд', value: 'Next.js 16, React 19, TypeScript, Tailwind CSS v4' },
  { label: 'Бэкенд и БД', value: 'Supabase (PostgreSQL), REST API, Row Level Security' },
  { label: 'Авторизация', value: 'Supabase Auth (email/пароль, JWT-токены)' },
  { label: 'Хранилище', value: 'Supabase Storage (изображения товаров, оптимизация WebP)' },
  { label: 'Хостинг', value: 'TouchDub — VPS с Docker-контейнеризацией, автодеплой при обновлении' },
  { label: 'Оптимизация', value: 'SSR, ленивая загрузка, адаптивные изображения, сжатие' },
];

const advantages = [
  {
    title: 'Мгновенная загрузка',
    desc: 'Серверный рендеринг (SSR) — страницы грузятся быстро, что критично для мобильных пользователей в регионах.',
  },
  {
    title: 'Мобильный приоритет',
    desc: 'Полностью адаптивный интерфейс. Удобные кнопки, нижняя навигация, оптимизация под касания.',
  },
  {
    title: 'Масштабируемость',
    desc: 'Архитектура позволяет добавлять новые категории, бренды, способы оплаты и интеграции без переписывания.',
  },
  {
    title: 'Безопасность',
    desc: 'Row Level Security на уровне базы данных. Каждый пользователь видит только свои данные. Защита от SQL-инъекций и XSS.',
  },
  {
    title: 'Переносимость',
    desc: 'Docker-контейнер можно развернуть на любом хостинге — облачном или выделенном сервере. Нет привязки к платформе.',
  },
  {
    title: 'AI-готовность',
    desc: 'REST API позволяет подключить голосового AI-ассистента, чат-ботов, WhatsApp-интеграции и другие каналы продаж.',
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-8 md:py-14">

      {/* Hero */}
      <section className="mb-12 md:mb-16">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/images/logo-white-full.png"
            alt="АЛТЕХ"
            width={160}
            height={42}
            className="h-10 w-auto md:h-12"
          />
          <div className="h-8 w-px bg-border-subtle" />
          <span className="text-sm text-text-muted">Платформа электронной коммерции</span>
        </div>
        <h1 className="font-display text-2xl md:text-4xl text-text-primary mb-4 leading-tight">
          Интернет-магазин <span className="text-accent-yellow">нового поколения</span> для оптово-розничной торговли
        </h1>
        <p className="text-text-secondary text-base md:text-lg max-w-3xl leading-relaxed">
          Полнофункциональная платформа для продажи горюче-смазочных материалов
          и автозапчастей с&nbsp;личным кабинетом, бонусной программой и&nbsp;подготовкой
          к&nbsp;интеграции с&nbsp;голосовым AI-ассистентом.
        </p>
      </section>

      {/* Модули */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Модули платформы
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {modules.map((m) => (
            <div
              key={m.title}
              className="rounded-xl border border-border-subtle bg-bg-card p-5 transition-colors hover:border-border-accent"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{m.title}</h3>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Технологии */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Технологический стек
        </h2>
        <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
          {stack.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4 ${
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

      {/* Преимущества */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Ключевые преимущества
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div key={a.title} className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">{a.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Интеграции (будущее) */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Перспективные интеграции
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">SIPmind — голосовой AI</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Клиент звонит на номер компании. AI-ассистент принимает звонок, уточняет
              потребность, находит товар в каталоге и оформляет заказ — автоматически,
              без участия менеджера.
            </p>
          </div>
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">WhatsApp-заказы</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Клиент пишет в WhatsApp — оператор или бот собирает заказ
              и отправляет персональную ссылку. Клиент переходит на сайт, видит
              готовую корзину с товарами и оплачивает онлайн.
            </p>
          </div>
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">ЮKassa</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Подключение интернет-эквайринга для приёма платежей банковскими картами,
              через СБП и электронные кошельки. Автоматическое подтверждение оплаты
              через webhook.
            </p>
          </div>
        </div>
      </section>

      {/* Схема работы WhatsApp */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Как работают WhatsApp-заказы
        </h2>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
          <div className="flex flex-col gap-4 md:gap-0">
            {[
              { step: '1', text: 'Клиент пишет в WhatsApp: «Нужно масло ROLF 5W-40, 4 литра»' },
              { step: '2', text: 'Оператор или бот находит товар и формирует заказ через панель' },
              { step: '3', text: 'Система генерирует ссылку: altech-store.ru/cart?items=rolf-5w40:1' },
              { step: '4', text: 'Клиент переходит по ссылке — корзина уже заполнена, остаётся оплатить' },
              { step: '5', text: 'Оплата онлайн → заказ подтверждён → клиент получает уведомление' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-yellow/15 text-sm font-bold text-accent-yellow">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-text-secondary">{item.text}</p>
                  {i < 4 && (
                    <div className="ml-0 mt-2 mb-2 h-4 w-px bg-border-subtle md:ml-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Хостинг */}
      <section className="mb-12 md:mb-16">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-6">
          Инфраструктура
        </h2>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Текущий хостинг — TouchDub</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Приложение развёрнуто на выделенном сервере с Docker-контейнеризацией и автоматическим
                деплоем. При необходимости платформа легко переносится на любой другой хостинг или
                облачный провайдер (Yandex Cloud, VK Cloud, и др.) без изменений в коде.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Автоматизация</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Каждое обновление кода автоматически проходит сборку и публикуется на сервере.
                Нулевой простой при обновлении — пользователи не замечают изменений.
                SSL-сертификат, мониторинг и бэкапы базы данных включены.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <Link
          href="/catalog/lubricants"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow px-8 py-3.5 text-sm font-bold text-bg-primary transition-all hover:shadow-[0_0_24px_rgba(255,214,0,0.3)]"
        >
          Перейти в каталог
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
