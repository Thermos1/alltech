import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'О платформе — АЛТЕХ',
  description: 'Цифровая платформа для оптово-розничной торговли ГСМ. Бизнес-модель, возможности, онбординг.',
};

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

      {/* ═══════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
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
          Платформа, которая продаёт<br className="hidden md:block" /> пока вы заняты бизнесом
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed mb-8">
          Цифровая платформа для оптово-розничной торговли ГСМ.
          Автоматизирует повторные продажи, мотивирует менеджеров
          и удерживает клиентов — без ручного контроля.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5">
            <p className="font-display text-2xl text-accent-yellow mb-1">1 клик</p>
            <p className="text-xs text-text-primary font-medium">Повтор заказа</p>
            <p className="text-[11px] text-text-muted mt-1">Клиент повторяет прошлый заказ за 10 секунд вместо 10 минут</p>
          </div>
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <p className="font-display text-2xl text-accent-cyan mb-1">4 мес.</p>
            <p className="text-xs text-text-primary font-medium">Прогноз замены масла</p>
            <p className="text-[11px] text-text-muted mt-1">Платформа напоминает менеджеру позвонить клиенту до того, как он уйдёт к конкуренту</p>
          </div>
          <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5">
            <p className="font-display text-2xl text-accent-magenta mb-1">CRM</p>
            <p className="text-xs text-text-primary font-medium">Полная воронка</p>
            <p className="text-[11px] text-text-muted mt-1">Менеджер собирает корзину, отправляет ссылку в WhatsApp — клиент оплачивает за 30 секунд</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. КАК ПЛАТФОРМА ЗАРАБАТЫВАЕТ ДЕНЬГИ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Юнит-экономика
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Как платформа зарабатывает деньги
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-yellow/10 text-accent-yellow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Удержание клиентов (LTV)</h3>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                <span className="text-accent-yellow font-medium">Тиерная лояльность:</span> кэшбэк растёт с покупками — от 3% (Старт) до 15% (Платина).
                Клиент на уровне Золото (10%) не уйдёт к конкуренту, который даёт 5%.
              </p>
              <p>
                <span className="text-accent-yellow font-medium">Повтор заказа:</span> одна кнопка восстанавливает корзину из прошлого заказа.
                Флит-менеджер, который каждый месяц берёт одно и то же — делает это за 10 секунд.
              </p>
              <p>
                <span className="text-accent-yellow font-medium">Бонусы, а не скидки:</span> бонусы нужно потратить — клиент возвращается.
                Скидка работает один раз и снижает маржу. Бонус удерживает.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10 text-accent-cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Прогноз замены масла</h3>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                <span className="text-accent-cyan font-medium">Автоматический расчёт:</span> дата покупки + 4 месяца = время замены.
                Менеджер видит на дашборде блок «Требуют внимания» с конкретными клиентами.
              </p>
              <p>
                <span className="text-accent-cyan font-medium">Проактивные продажи:</span> конкуренты ждут, пока клиент сам позвонит.
                АЛТЕХ звонит первым — через WhatsApp прямо из карточки клиента.
              </p>
              <p>
                <span className="text-accent-cyan font-medium">Результат:</span> менеджер не забывает ни одного клиента.
                Один человек обслуживает 50+ клиентов с предсказуемым циклом.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-magenta/10 text-accent-magenta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Децентрализованные продажи</h3>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                <span className="text-accent-magenta font-medium">Комиссия 3%:</span> менеджеры работают на проценте от продаж.
                Расходы на продажи пропорциональны доходам.
              </p>
              <p>
                <span className="text-accent-magenta font-medium">Прозрачность:</span> каждый менеджер видит свою комиссию в реальном времени —
                разбивка по месяцам, по заказам, с номером и суммой. Нет споров при выплате.
              </p>
              <p>
                <span className="text-accent-magenta font-medium">Масштаб:</span> нет потолка продаж.
                Можно подключать сколько угодно менеджеров — система масштабируется без дополнительных затрат.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">CRM-система менеджера</h3>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                <span className="text-green-400 font-medium">Корзина менеджера:</span> менеджер собирает корзину с товарами,
                получает ссылку и отправляет клиенту в WhatsApp. Клиент открывает — товары уже в корзине — нажимает «Оплатить».
              </p>
              <p>
                <span className="text-green-400 font-medium">Заметки и поиск:</span> к каждому клиенту можно оставить заметку.
                Поиск по имени, телефону. Фильтры по менеджеру и статусу (активен, остывает, новый).
              </p>
              <p>
                <span className="text-green-400 font-medium">Аналитика и склад:</span> дашборд с выручкой, средним чеком, топ товаров,
                топ клиентов, менеджеры по выручке. Склад с цветокодом остатков и автосписанием при оплате.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. ПОЧЕМУ СДЕЛАНО ИМЕННО ТАК
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Продуктовые решения
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Почему сделано именно так
        </p>

        <div className="space-y-3">
          {[
            {
              decision: 'SMS вместо email и пароля',
              why: 'Водители и механики не помнят пароли. Телефон — естественная идентификация в B2B. Вход за 15 секунд без регистрации.',
              alternative: 'Email-регистрация: 40% отказов на этапе «подтвердите почту». Для B2B-клиентов, которые покупают масло — это неприемлемый барьер.',
            },
            {
              decision: 'Розлив масла с шагом 5 литров',
              why: 'Региональная специфика: клиент берёт ровно столько, сколько нужно. 15 литров? 25? Без проблем. Цена пересчитывается автоматически.',
              alternative: 'Фиксированные упаковки (5л, 20л, 208л): клиент, которому нужно 15л — уходит к конкуренту, где продают на розлив.',
            },
            {
              decision: 'Прогноз замены масла в CRM',
              why: 'Превращает реактивные продажи в проактивные. Система считает дату следующей замены. Менеджер звонит ДО того, как клиент задумался.',
              alternative: 'Ручные напоминания в Excel: человеческий фактор, забывают. При 50+ клиентах — невозможно отследить.',
            },
            {
              decision: 'Комиссионная система',
              why: 'Масштабируемость без потолка: 5 менеджеров или 50 — расходы пропорциональны доходам. Менеджер мотивирован продавать больше.',
              alternative: 'Фиксированная мотивация: потолок по числу клиентов, нет стимула перевыполнять план.',
            },
            {
              decision: 'Бонусы вместо прямых скидок',
              why: 'Бонусы нужно потратить — клиент обязан вернуться. Скидка работает один раз. Бонусная программа с тиерами создаёт switching costs.',
              alternative: 'Скидки 5-10% всем: снижают маржу без удержания. Клиент берёт скидку и уходит к конкуренту на следующий заказ.',
            },
            {
              decision: 'Корзина менеджера с WhatsApp-доставкой',
              why: 'Менеджер собирает корзину в CRM → получает уникальную ссылку → отправляет в WhatsApp → клиент открывает, видит товары и оплачивает. Весь цикл — 30 секунд.',
              alternative: 'Клиент сам ищет товары: долго, ошибки, уход к конкуренту. Менеджер диктует по телефону: неэффективно при 50+ клиентах.',
            },
            {
              decision: 'Песочница ЮKassa вместо заглушки',
              why: 'Реальный платёжный flow: инициация — страница оплаты — webhook — статус. Для запуска в продакшн — только поменять ключи. Ноль доработок.',
              alternative: 'Мок-оплата с кнопкой «Оплачено»: не даёт понимания реального UX. Требует переписывания при интеграции.',
            },
          ].map((item) => (
            <div key={item.decision} className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">{item.decision}</h3>
              <p className="text-xs text-text-primary leading-relaxed mb-2">{item.why}</p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                <span className="text-accent-magenta font-medium">Альтернатива:</span> {item.alternative}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. МОДУЛИ ПЛАТФОРМЫ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Что входит
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Модули платформы
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: 'Каталог товаров', description: 'Категоризация по типам ГСМ, фильтры по бренду и вязкости. Карточки с допусками, вариантами фасовок и ценами. Розлив масла с шагом 5 литров.', status: 'live' as const },
            { title: 'Поиск по каталогу', description: 'Мгновенный поиск по названию, бренду, вязкости и допускам. Доступен из шапки на любой странице.', status: 'live' as const },
            { title: 'Корзина и повтор заказа', description: 'Добавление в один клик, редактирование количества, автопересчёт. Повтор предыдущего заказа одной кнопкой.', status: 'live' as const },
            { title: 'SMS-авторизация', description: 'Вход и регистрация клиентов по SMS-коду. Отдельный вход для сотрудников. Менеджеры входят по телефону — автоматический редирект в панель.', status: 'live' as const },
            { title: 'Оформление и оплата', description: 'Форма с валидацией, применение промокодов и бонусов, расчёт итога. Оплата через песочницу ЮKassa (полный flow, готов к запуску).', status: 'live' as const },
            { title: 'Личный кабинет', description: 'История заказов со статусами, бонусный уровень с прогресс-баром, реферальный код, повтор заказа, профиль.', status: 'live' as const },
            { title: 'Тиерная бонусная программа', description: 'Растущий кэшбэк: Старт 3% — Бронза 5% — Серебро 7% — Золото 10% — Платина 15%. Уровень растёт с накоплением покупок.', status: 'live' as const },
            { title: 'Промокоды', description: 'Процентные и фиксированные скидки. Контроль сроков, лимитов использования и минимальной суммы.', status: 'live' as const },
            { title: 'CRM-система', description: 'Привязка клиентов к менеджерам. Поиск по имени/телефону, фильтры по менеджеру и статусу. Заметки к клиенту. Прогноз замены масла (обратный отсчёт в днях). WhatsApp из карточки.', status: 'live' as const },
            { title: 'Корзина менеджера', description: 'Менеджер собирает корзину из каталога, выбирает клиента, получает уникальную ссылку. Отправляет в WhatsApp — клиент открывает и оплачивает. Статусы: ожидает → просмотрена → оформлена.', status: 'live' as const },
            { title: 'Склад и инвентаризация', description: 'Таблица всех вариантов с цветокодом остатков: красный (0), жёлтый (<5), зелёный (5+). Фильтр по бренду, toggle «низкий остаток». Автосписание при оплате заказа.', status: 'live' as const },
            { title: 'Аналитика', description: 'Выручка по месяцам, средний чек, топ товаров, топ клиентов, менеджеры по выручке, заказы по статусам. CSS-only графики без внешних библиотек.', status: 'live' as const },
            { title: 'Журнал действий', description: 'Аудит: кто назначил менеджера, кто создал корзину, кто оплатил заказ. Таблица: дата, автор, действие, детали. Логирование в 6 API-эндпоинтах.', status: 'live' as const },
            { title: 'Комиссии менеджеров', description: 'Автоматическое начисление с каждого оплаченного заказа. Разбивка по месяцам, история по заказам, номер и сумма. Настраиваемая ставка (по умолчанию 3%).', status: 'live' as const },
            { title: 'Панель администратора', description: 'Два уровня: Админ — 12 разделов (заказы, клиенты, менеджеры, корзины, склад, аналитика, журнал, комиссии, товары, бренды, категории). Менеджер — 5 разделов.', status: 'live' as const },
            { title: 'REST API (FastAPI)', description: 'Серверный бэкенд на FastAPI: эндпоинты для внешних систем, поиск товаров, проверка остатков, создание заказов. Bearer-авторизация, Pydantic-валидация.', status: 'live' as const },
            { title: 'SIPmind — голосовой AI', description: 'Потенциальная интеграция: клиент звонит — AI-ассистент принимает, находит товар и оформляет заказ через подготовленный API.', status: 'next' as const },
          ].map((m) => (
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

      {/* ═══════════════════════════════════════════════
          5. ОНБОРДИНГ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Онбординг
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-3">
          Как смотреть — пошаговый маршрут
        </p>
        <p className="text-text-secondary text-sm mb-6 max-w-2xl">
          Три роли, три сценария. Пройдите каждый за 5 минут — увидите платформу глазами покупателя, менеджера и администратора.
        </p>

        <div className="space-y-6">
          {/* Buyer */}
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-yellow/15 text-accent-yellow font-display text-lg">1</div>
              <div>
                <h3 className="text-sm font-semibold text-accent-yellow">Сценарий: Покупатель</h3>
                <p className="text-[11px] text-text-muted">Весь путь от каталога до личного кабинета</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">1.</span>
                <p>Откройте <Link href="/catalog/lubricants" className="text-accent-cyan hover:text-accent-yellow transition-colors">каталог</Link>. Выберите категорию «Моторные масла». Нажмите на карточку — откроется попап с вариантами. Попробуйте розлив: двигайте ползунок объёма.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">2.</span>
                <p>Добавьте 2-3 товара в <Link href="/cart" className="text-accent-cyan hover:text-accent-yellow transition-colors">корзину</Link>. Измените количество, удалите позицию. Нажмите «Оформить».</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">3.</span>
                <p>Нажмите <Link href="/login" className="text-accent-cyan hover:text-accent-yellow transition-colors">Войти</Link>. Введите <span className="text-text-primary font-medium">любой номер телефона</span> (можно выдуманный) — SMS-код показывается прямо на экране (демо-режим).</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">4.</span>
                <p>Заполните форму заказа. Попробуйте промокод <span className="font-mono text-text-primary">ALTECH10</span>. Пройдите оплату через песочницу ЮKassa (тестовая карта — любые цифры).</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">5.</span>
                <p>Зайдите в <Link href="/cabinet" className="text-accent-cyan hover:text-accent-yellow transition-colors">личный кабинет</Link>. Обратите внимание: бонусный уровень, прогресс-бар, реферальный код. Откройте заказ — кнопка «Повторить заказ».</p>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 border-t border-accent-yellow/10 pt-3">
              Обратите внимание: бонусы начисляются автоматически после оплаты. Уровень лояльности растёт с каждой покупкой.
            </p>
          </div>

          {/* Manager */}
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan font-display text-lg">2</div>
              <div>
                <h3 className="text-sm font-semibold text-accent-cyan">Сценарий: Менеджер</h3>
                <p className="text-[11px] text-text-muted">CRM, клиенты, комиссия, прогноз замены</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex gap-3">
                <span className="text-accent-cyan font-bold shrink-0">1.</span>
                <p>Войдите через <Link href="/admin-login" className="text-accent-cyan hover:text-accent-yellow transition-colors">/admin-login</Link>: <span className="font-mono text-text-primary">manager@altech-store.ru</span> / <span className="font-mono text-text-primary">manager2025</span> или <span className="font-mono text-text-primary">hello@alltech.ru</span> / <span className="font-mono text-text-primary">manager26</span></p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-cyan font-bold shrink-0">2.</span>
                <p>На дашборде: заказы ваших клиентов, комиссия за месяц и за всё время. Блок «Требуют внимания» — «Через 12 дней» или «Просрочено на 5 дней» с конкретными клиентами.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-cyan font-bold shrink-0">3.</span>
                <p>Откройте <Link href="/admin/clients" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Мои клиенты»</Link> — используйте поиск по имени/телефону, фильтр по статусу. В карточке клиента: заметки, прогноз замены масла, WhatsApp.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-cyan font-bold shrink-0">4.</span>
                <p>Откройте <Link href="/admin/shared-cart" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Корзины»</Link> → «Собрать корзину». Найдите товары, добавьте, нажмите «Создать». Скопируйте ссылку или отправьте через WhatsApp.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-cyan font-bold shrink-0">5.</span>
                <p>Откройте <Link href="/admin/commissions" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Комиссии»</Link> — разбивка по месяцам: за какой заказ, какая сумма, какой процент. Прозрачно для бухгалтерии.</p>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 border-t border-accent-cyan/10 pt-3">
              Обратите внимание: менеджер видит только своих привязанных клиентов. Корзину может собрать и отправить любому клиенту. В шапке — «АЛТЕХ Менеджер», не «Admin».
            </p>
          </div>

          {/* Admin */}
          <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-magenta/15 text-accent-magenta font-display text-lg">3</div>
              <div>
                <h3 className="text-sm font-semibold text-accent-magenta">Сценарий: Администратор</h3>
                <p className="text-[11px] text-text-muted">Полный контроль: заказы, клиенты, менеджеры, комиссии</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">1.</span>
                <p>Войдите через <Link href="/admin-login" className="text-accent-cyan hover:text-accent-yellow transition-colors">/admin-login</Link>: <span className="font-mono text-text-primary">admin@altech-store.ru</span> / <span className="font-mono text-text-primary">admin2025</span></p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">2.</span>
                <p>Дашборд: все заказы, общая выручка, клиенты без менеджера (жёлтое предупреждение). Блок прогноза замены масла — по всем клиентам.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">3.</span>
                <p>Откройте <Link href="/admin/clients" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Клиенты»</Link> — поиск, фильтр по менеджеру/статусу, назначение менеджера. <Link href="/admin/orders" className="text-accent-cyan hover:text-accent-yellow transition-colors">Заказ</Link> — смена статуса (оплачен → в обработке → отправлен).</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">4.</span>
                <p>Откройте <Link href="/admin/stock" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Склад»</Link> — все позиции с цветокодом остатков. <Link href="/admin/analytics" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Аналитика»</Link> — выручка по месяцам, топ товаров, топ клиентов, менеджеры по выручке.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">5.</span>
                <p><Link href="/admin/managers" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Менеджеры»</Link> — создать нового или назначить из клиентов. <Link href="/admin/activity" className="text-accent-cyan hover:text-accent-yellow transition-colors">«Журнал»</Link> — полный аудит действий в системе.</p>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 border-t border-accent-magenta/10 pt-3">
              Обратите внимание: админ видит ВСЕ заказы, клиентов, корзины и действия. 12 разделов панели управления. Может создать менеджера с нуля или назначить из клиентов.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. ТЕСТОВЫЕ АККАУНТЫ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Тестовые аккаунты
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-yellow"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <h3 className="text-sm font-semibold text-accent-yellow">Покупатель</h3>
            </div>
            <p className="text-xs text-text-secondary mb-2">Телефон: <span className="text-text-primary">любой номер</span></p>
            <p className="text-[11px] text-text-muted">SMS-код на экране (демо). Аккаунт создаётся автоматически.</p>
            <div className="mt-3 flex gap-3 text-[11px]">
              <Link href="/login" className="text-accent-cyan hover:text-accent-yellow transition-colors">Вход →</Link>
              <Link href="/cabinet" className="text-accent-cyan hover:text-accent-yellow transition-colors">Кабинет →</Link>
            </div>
          </div>

          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              <h3 className="text-sm font-semibold text-accent-cyan">Менеджер</h3>
            </div>
            <p className="text-xs text-text-secondary mb-1"><span className="font-mono text-text-primary select-all">manager@altech-store.ru</span> / <span className="font-mono text-text-primary select-all">manager2025</span></p>
            <p className="text-xs text-text-secondary mb-2"><span className="font-mono text-text-primary select-all">hello@alltech.ru</span> / <span className="font-mono text-text-primary select-all">manager26</span></p>
            <p className="text-[11px] text-text-muted">CRM: клиенты, заказы, корзины, комиссия, прогноз замены, заметки</p>
            <div className="mt-3 flex gap-3 text-[11px]">
              <Link href="/admin-login" className="text-accent-cyan hover:text-accent-yellow transition-colors">Вход →</Link>
              <Link href="/admin" className="text-accent-cyan hover:text-accent-yellow transition-colors">Панель →</Link>
            </div>
          </div>

          <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-magenta"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <h3 className="text-sm font-semibold text-accent-magenta">Администратор</h3>
            </div>
            <p className="text-xs text-text-secondary mb-1"><span className="font-mono text-text-primary select-all">admin@altech-store.ru</span></p>
            <p className="text-xs text-text-secondary mb-2">Пароль: <span className="font-mono text-text-primary select-all">admin2025</span></p>
            <p className="text-[11px] text-text-muted">Полный доступ: заказы, клиенты, менеджеры, корзины, склад, аналитика, журнал</p>
            <div className="mt-3 flex gap-3 text-[11px]">
              <Link href="/admin-login" className="text-accent-cyan hover:text-accent-yellow transition-colors">Вход →</Link>
              <Link href="/admin" className="text-accent-cyan hover:text-accent-yellow transition-colors">Панель →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          7. РЕКОМЕНДАЦИИ ПО РАЗВИТИЮ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Видение продакта
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Рекомендации по развитию
        </p>

        <div className="space-y-3">
          {[
            {
              title: 'ЮKassa — боевой режим',
              impact: 'Конверсия +25-30%',
              desc: 'Песочница ЮKassa уже интегрирована с полным flow. Для запуска — зарегистрировать аккаунт ЮKassa и подставить ключи. Ноль доработок в коде.',
              accent: 'text-accent-yellow',
              bg: 'bg-accent-yellow/10 border-accent-yellow/20',
            },
            {
              title: 'SIPmind — голосовой AI',
              impact: 'Потенциально',
              desc: 'API подготовлен для интеграции (search, check-stock, create-order). В будущем: водитель звонит — AI принимает, находит товар, оформляет заказ автоматически.',
              accent: 'text-accent-cyan',
              bg: 'bg-accent-cyan/10 border-accent-cyan/20',
            },
            {
              title: 'WhatsApp-канал продаж',
              impact: 'Реализовано',
              desc: 'Менеджер собирает корзину в CRM, нажимает «WhatsApp» — клиент получает ссылку, открывает и оплачивает. Следующий шаг: чат-бот для автоматической обработки входящих запросов.',
              accent: 'text-green-400',
              bg: 'bg-green-500/10 border-green-500/20',
            },
            {
              title: 'Мобильное приложение',
              impact: 'Retention через push',
              desc: 'API-first архитектура позволяет подключить нативное приложение к тому же бэкенду. Push-уведомления: «Пора менять масло» вместо SMS.',
              accent: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              title: 'Доставка — СДЭК и другие',
              impact: 'Вся РФ',
              desc: 'Подключение агрегатора доставки (СДЭК, DPD, Boxberry): расчёт стоимости в корзине, трекинг, пункты выдачи. Федеральный масштаб без своей логистики.',
              accent: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              title: '1С-интеграция',
              impact: 'Автоматизация склада',
              desc: 'Двусторонняя синхронизация: остатки и цены из 1С — каталог на сайте. Заказы с сайта — 1С. Исключает ручной ввод.',
              accent: 'text-text-secondary',
              bg: 'bg-bg-card border-border-subtle',
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl border p-5 ${item.bg}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className={`text-sm font-semibold ${item.accent}`}>{item.title}</h3>
                <span className={`text-[10px] font-medium ${item.accent} whitespace-nowrap`}>{item.impact}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          8. МАСШТАБИРОВАНИЕ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Масштабирование
        </h2>
        <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-6">
          <p className="text-xs text-text-secondary leading-relaxed mb-5 max-w-2xl">
            Боль покупателя очевидна: люди давно привыкли заказывать продукты домой, потому что берегут время.
            ГСМ — не исключение. Меньше кликов, лучше цены, больше бонусов, доставка до двери — и клиент не уходит.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Доставка по всей РФ</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                СДЭК, DPD, Boxberry — расчёт стоимости в корзине, пункты выдачи, трекинг. Якутск сегодня, вся Россия завтра.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Мультирегиональность</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Дополнительные склады, региональные ценовые матрицы, локальные каталоги — без изменения ядра платформы.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Каналы продаж</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Сайт, WhatsApp, Telegram, мобильное приложение — все каналы через один API и одну БД.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Мобильное приложение</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                API-first: нативное приложение подключается к тому же бэкенду. Push вместо SMS. Заказ за 3 тапа.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          9. ПОД КАПОТОМ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Под капотом
        </h2>
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { value: '225', label: 'тестов', sub: '18 test suites' },
            { value: '0', label: 'ошибок TS', sub: 'strict mode' },
            { value: '< 1 мин', label: 'CI/CD', sub: 'push — deploy' },
            { value: '100%', label: 'крит. путей', sub: 'оплата, auth, CRM' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border-subtle bg-bg-card p-4 text-center">
              <p className="font-display text-xl text-accent-yellow">{m.value}</p>
              <p className="text-xs text-text-primary mt-0.5">{m.label}</p>
              <p className="text-[10px] text-text-muted">{m.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
          {[
            { label: 'Фронтенд', value: 'Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Zustand 5, Zod 4' },
            { label: 'Бэкенд API', value: 'FastAPI (Python 3.11+), Pydantic v2, async, structlog' },
            { label: 'База данных', value: 'Supabase PostgreSQL 15, Row Level Security, RBAC' },
            { label: 'Авторизация', value: 'SMS OTP + Supabase Auth, JWT, HttpOnly cookies' },
            { label: 'Оплата', value: 'ЮKassa (песочница), полный webhook flow' },
            { label: 'Деплой', value: 'Docker, GitHub Actions CI/CD, Coolify, zero-downtime' },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className={`flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 ${
                i !== arr.length - 1 ? 'border-b border-border-subtle' : ''
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-accent-cyan w-28 flex-shrink-0">{item.label}</span>
              <span className="text-xs text-text-secondary">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          10. CTA — ГОТОВЫ ЗАПУСТИТЬ?
      ═══════════════════════════════════════════════ */}
      <section className="mb-8">
        <div className="rounded-2xl border border-accent-yellow/30 bg-gradient-to-br from-accent-yellow/10 to-accent-yellow/5 p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl text-text-primary mb-3">
            Готовы запустить?
          </h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Это пилотная версия с демо-данными и тестовыми аккаунтами.
            Для настройки под ваш бизнес — реальные товары, цены, сотрудники,
            боевая оплата — обратитесь в TechDab.
          </p>
          <p className="text-text-muted text-xs mb-6">
            Мы обнулим тестовые данные, настроим ЮKassa, загрузим ваш каталог
            и создадим аккаунты для сотрудников.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://techdab.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow px-6 py-3 text-sm font-bold text-bg-primary transition-all hover:shadow-[0_0_24px_rgba(255,214,0,0.3)]"
            >
              Связаться с TechDab
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a
              href="https://t.me/techdab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-cyan hover:text-accent-cyan"
            >
              Написать в Telegram
            </a>
          </div>
        </div>
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
