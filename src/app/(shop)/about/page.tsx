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
          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-green-400">
            Live
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
                <span className="text-green-400 font-medium">Аналитика и склад:</span> дашборд с 7 метриками (выручка, заказы, средний чек, товары, клиенты, бренды),
                складские алерты, сводка статусов заказов, топ-5 товаров по продажам. Склад с цветокодом остатков и автосписанием при оплате.
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
              decision: 'ЮKassa — полный платёжный цикл',
              why: 'Полноценная оплата через ЮKassa: инициация — страница оплаты — webhook — автоматическое обновление статуса. Банковские карты, СБП, SberPay. Бонусы начисляются после оплаты.',
              alternative: 'Оплата при получении: потери на невыкупах 15-25%. Онлайн-оплата гарантирует 100% конверсию заказов.',
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
            { title: 'SMS-авторизация', description: 'Вход и регистрация клиентов по SMS-коду через SMS.ru (отправитель OOO_Alteh). Отдельный вход для сотрудников. Менеджеры входят по телефону — автоматический редирект в панель.', status: 'live' as const },
            { title: 'Оформление и оплата', description: 'Форма с валидацией, применение промокодов и бонусов, расчёт итога. Онлайн-оплата через ЮKassa: банковские карты, СБП, SberPay. Webhook-уведомления, автообновление статуса.', status: 'live' as const },
            { title: 'Личный кабинет', description: 'История заказов со статусами, бонусный уровень с прогресс-баром, реферальный код, повтор заказа, профиль.', status: 'live' as const },
            { title: 'Тиерная бонусная программа', description: 'Растущий кэшбэк: Старт 3% — Бронза 5% — Серебро 7% — Золото 10% — Платина 15%. Уровень растёт с накоплением покупок.', status: 'live' as const },
            { title: 'Промокоды', description: 'Процентные и фиксированные скидки. Контроль сроков, лимитов использования и минимальной суммы.', status: 'live' as const },
            { title: 'CRM-система', description: 'Привязка клиентов к менеджерам. Поиск по имени/телефону, фильтры по менеджеру и статусу. Заметки к клиенту. Прогноз замены масла (обратный отсчёт в днях). WhatsApp из карточки.', status: 'live' as const },
            { title: 'Корзина менеджера', description: 'Менеджер собирает корзину из каталога, выбирает клиента, получает уникальную ссылку. Отправляет в WhatsApp — клиент открывает и оплачивает. Статусы: ожидает → просмотрена → оформлена.', status: 'live' as const },
            { title: 'Склад и инвентаризация', description: 'Таблица всех вариантов с цветокодом остатков: красный (0), жёлтый (<5), зелёный (5+). Фильтр по бренду, toggle «низкий остаток». Автосписание при оплате заказа.', status: 'live' as const },
            { title: 'Аналитика', description: 'Выручка по месяцам, средний чек, топ товаров, топ клиентов, менеджеры по выручке, заказы по статусам. CSS-only графики без внешних библиотек.', status: 'live' as const },
            { title: 'Журнал действий', description: 'Аудит: кто назначил менеджера, кто создал корзину, кто оплатил заказ. Таблица: дата, автор, действие, детали. Логирование в 6 API-эндпоинтах.', status: 'live' as const },
            { title: 'Комиссии менеджеров', description: 'Автоматическое начисление с каждого оплаченного заказа. Разбивка по месяцам, история по заказам, номер и сумма. Настраиваемая ставка (по умолчанию 3%).', status: 'live' as const },
            { title: 'Панель администратора', description: 'Два уровня: Админ — 14 разделов (заказы, клиенты, менеджеры, корзины, склад, аналитика, журнал, комиссии, товары, бренды, категории, промокоды, AI-инструменты). Менеджер — 5 разделов.', status: 'live' as const },
            { title: 'AI Генератор карточек', description: 'Загрузите фото + опишите товар — AI создаёт план слайдов, генерирует готовые PNG/PDF. 12 типов слайдов, 4 стиля, 6 платформ (WB, Ozon, Shopify, Instagram, Telegram, Pinterest). Satori + Sharp рендеринг.', status: 'live' as const },
            { title: 'Конструктор карточек', description: 'Ручной режим: выбор стиля, платформы, элементов. Настройка цветов, бейджи, характеристики. Масштаб и позиционирование фото. Экспорт PNG/JPG/PDF.', status: 'live' as const },
            { title: 'Конструктор каруселей', description: '7 типов слайдов для товарных каруселей: обложка, характеристики, преимущества, совместимость, варианты, применение, гарантия. AI-генерация текстов через Claude.', status: 'live' as const },
            { title: 'Удаление фона / Очистка', description: 'Удаление фона с фото товаров (@imgly/background-removal, WASM, 100% в браузере). Очистка карточек от водяных знаков и бейджей конкурентов.', status: 'live' as const },
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
                <p>Нажмите <Link href="/login" className="text-accent-cyan hover:text-accent-yellow transition-colors">Войти</Link>. Введите <span className="text-text-primary font-medium">свой номер телефона</span> — на него придёт SMS-код от отправителя OOO_Alteh. Вход за 15 секунд.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-accent-yellow font-bold shrink-0">4.</span>
                <p>Заполните форму заказа. Попробуйте промокод <span className="font-mono text-text-primary">ALTECH10</span>. Оплатите через ЮKassa — банковская карта, СБП или SberPay.</p>
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
                <p>Дашборд: 7 карточек (выручка, заказы, оплачено, средний чек, товары, клиенты, бренды). Складские алерты, сводка статусов заказов, топ-5 товаров. Прогноз замены масла и клиенты без менеджера.</p>
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
              <div className="flex gap-3">
                <span className="text-accent-magenta font-bold shrink-0">6.</span>
                <p>Откройте <Link href="/admin/image-tools" className="text-accent-cyan hover:text-accent-yellow transition-colors">«AI-инструменты»</Link> — генератор карточек для маркетплейсов: AI создаёт план слайдов, 4 стиля, 6 платформ. Удаление фона с фото, очистка от водяных знаков.</p>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 border-t border-accent-magenta/10 pt-3">
              Обратите внимание: админ видит ВСЕ заказы, клиентов, корзины и действия. 14 разделов панели управления + AI-инструменты для создания карточек товаров.
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
            <p className="text-xs text-text-secondary mb-2">Телефон: <span className="text-text-primary">ваш номер</span></p>
            <p className="text-[11px] text-text-muted">Реальная SMS от OOO_Alteh. Аккаунт создаётся автоматически.</p>
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
              title: 'Маркировка «Честный знак»',
              impact: 'Обязательно с 2025',
              desc: 'Обязательная маркировка моторных масел стартовала в 2025. Интеграция DataMatrix-кодов в чеки ЮKassa и складской учёт — гарантия легальности каждой единицы товара.',
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
              impact: 'Частично',
              desc: 'Менеджер собирает корзину в CRM и отправляет ссылку клиенту через WhatsApp. Следующий шаг: полноценный чат-бот для автоматической обработки входящих запросов и приёма заказов.',
              accent: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              title: 'Мобильное приложение',
              impact: 'При масштабировании',
              desc: 'Сейчас: PWA с mobile-first дизайном покрывает 100% сценариев (заказ раз в 3-4 мес.). Push-напоминания через WhatsApp/SMS/SIPmind дешевле и эффективнее (open rate 90%+). Нативное приложение — при базе 500+ клиентов с еженедельными заказами.',
              accent: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              title: 'Доставка — СДЭК / Энергия',
              impact: 'Вся РФ',
              desc: 'Интеграция с API СДЭК (бесплатное подключение): расчёт стоимости в корзине, пункты выдачи, трекинг. Крупные грузы (бочки) — ТК Энергия. Федеральный масштаб без своей логистики.',
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
          8. АНАЛИТИКА РЫНКА
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Аналитика рынка
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Почему ГСМ — это растущий рынок
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { value: '~200 млрд', label: 'руб./год', sub: 'рынок моторных масел РФ' },
            { value: '+5-8%', label: 'рост в деньгах', sub: 'ежегодно (сдвиг к синтетике)' },
            { value: '70-80%', label: 'российские бренды', sub: 'было 50% в 2022' },
            { value: '15-25%', label: 'валовая маржа', sub: 'оптово-розничная торговля' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-4 text-center">
              <p className="font-display text-xl text-accent-cyan">{m.value}</p>
              <p className="text-xs text-text-primary mt-0.5">{m.label}</p>
              <p className="text-[10px] text-text-muted">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
            <h3 className="text-sm font-semibold text-accent-yellow mb-3">Импортозамещение</h3>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p>Shell, Castrol, Mobil официально ушли с рынка. Вакуум заполняют российские производители: <span className="text-text-primary font-medium">Лукойл, Sintec, Rolf, Роснефть</span> — ТОП-5 по продажам.</p>
              <p>Корейские поставки (KIXX, GS Caltex) выросли на <span className="text-accent-cyan font-medium">+54 млн $</span> в 2024. АЛТЕХ работает с лидерами обоих направлений.</p>
              <p>Доля синтетики выросла с 30% до ~60% — это <span className="text-accent-yellow font-medium">сдвиг в премиум</span>, выше маржа, выше средний чек.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
            <h3 className="text-sm font-semibold text-accent-yellow mb-3">Экономика дистрибьютора</h3>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p><span className="text-text-primary font-medium">Средний B2B-чек:</span> 150 000 — 300 000 руб. (автопарки, СТО, субдистрибьюторы). Мелкий опт — от 50 000 руб.</p>
              <p><span className="text-text-primary font-medium">Маржинальность:</span> оптовая наценка 10-15%, мелкооптовая 20-30%, розничная до 50%. Премиальные бренды +3-5 п.п.</p>
              <p><span className="text-text-primary font-medium">Для входа нужен:</span> договор с производителем + склад (аренда) + менеджеры. Всё остальное — платформа.</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-text-muted mt-4">
          Источники: Автостат, Mordor Intelligence, CStore, Kolesa.ru, Data Insight. Данные за 2024-2025.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          8b. КОНКУРЕНТНЫЙ ЛАНДШАФТ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Конкурентный ландшафт
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Кто продаёт масла онлайн и почему у нас есть окно
        </p>

        {/* Counterfeit alert */}
        <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5 mb-6">
          <h3 className="text-sm font-semibold text-accent-magenta mb-2">Контрафакт — главная проблема отрасли</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="font-display text-2xl text-accent-magenta">54%</p>
              <p className="text-xs text-text-secondary mt-1">масел на рынке — подделки</p>
              <p className="text-[10px] text-text-muted">Autonews, август 2024</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl text-accent-magenta">43%</p>
              <p className="text-xs text-text-secondary mt-1">контрафакт в онлайн-канале</p>
              <p className="text-[10px] text-text-muted">рост с 29% за год (Коммерсант)</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl text-accent-yellow">03.2025</p>
              <p className="text-xs text-text-secondary mt-1">обязательная маркировка</p>
              <p className="text-[10px] text-text-muted">&laquo;Честный знак&raquo; (Logirus)</p>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mt-4">
            <span className="text-accent-yellow font-medium">Преимущество АЛТЕХ:</span> прямые договоры с производителями (Rolf, Sintec, KIXX, RhinOIL) —
            гарантия оригинальности каждой единицы. Специализированный магазин с прозрачной цепочкой поставок
            vs маркетплейс, где 43% товара — подделки.
          </p>
        </div>

        {/* Online competitors table */}
        <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary">Крупнейшие онлайн-игроки</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted">
                  <th className="text-left px-4 py-2.5 font-medium">Компания</th>
                  <th className="text-right px-4 py-2.5 font-medium">Выручка</th>
                  <th className="text-left px-4 py-2.5 font-medium">Тип</th>
                  <th className="text-left px-4 py-2.5 font-medium">Ограничения</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border-subtle/50">
                  <td className="px-4 py-2.5 text-text-primary font-medium">Exist.ru</td>
                  <td className="px-4 py-2.5 text-right text-accent-yellow font-medium">~50 млрд &#8381;</td>
                  <td className="px-4 py-2.5">Автозапчасти</td>
                  <td className="px-4 py-2.5">Масла — одна из сотен категорий, нет CRM для ГСМ</td>
                </tr>
                <tr className="border-b border-border-subtle/50">
                  <td className="px-4 py-2.5 text-text-primary font-medium">Autodoc.ru</td>
                  <td className="px-4 py-2.5 text-right text-accent-yellow font-medium">~28 млрд &#8381;</td>
                  <td className="px-4 py-2.5">Автозапчасти</td>
                  <td className="px-4 py-2.5">6 млн пользователей, но без специализации на ГСМ</td>
                </tr>
                <tr className="border-b border-border-subtle/50">
                  <td className="px-4 py-2.5 text-text-primary font-medium">Emex.ru</td>
                  <td className="px-4 py-2.5 text-right text-accent-yellow font-medium">~17 млрд &#8381;</td>
                  <td className="px-4 py-2.5">Маркетплейс</td>
                  <td className="px-4 py-2.5">Оценка Forbes $360 млн, но нет фокуса на масла</td>
                </tr>
                <tr className="border-b border-border-subtle/50">
                  <td className="px-4 py-2.5 text-text-primary font-medium">Ozon / WB</td>
                  <td className="px-4 py-2.5 text-right text-text-muted">маркетплейсы</td>
                  <td className="px-4 py-2.5">Универсальные</td>
                  <td className="px-4 py-2.5"><span className="text-accent-magenta font-medium">43% контрафакта</span>, нет экспертизы</td>
                </tr>
                <tr className="border-b border-border-subtle/50">
                  <td className="px-4 py-2.5 text-text-primary font-medium">МаслоМаркет</td>
                  <td className="px-4 py-2.5 text-right text-text-muted">61 магазин</td>
                  <td className="px-4 py-2.5">Специализированный</td>
                  <td className="px-4 py-2.5">Офлайн-сеть с 1996 г., слабый e-commerce</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-text-primary font-medium">Лукойл-Shop</td>
                  <td className="px-4 py-2.5 text-right text-text-muted">D2C</td>
                  <td className="px-4 py-2.5">Монобренд</td>
                  <td className="px-4 py-2.5">Только Лукойл, нет мультибрендовости</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Yakutsk competitors */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
            <h3 className="text-sm font-semibold text-accent-cyan mb-3">Конкуренция в Якутске</h3>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p><span className="text-text-primary font-medium">Онлайн — пусто.</span> &laquo;Родные масла&raquo; доставляют ТК без локального склада. Exist.ru работает через партнёров. Остальные — мелкие офлайн-точки без e-commerce.</p>
              <p><span className="text-accent-cyan font-medium">АЛТЕХ — единственный</span> специализированный интернет-магазин масел в Якутске с полноценной CRM, бонусной программой и складом на месте.</p>
            </div>
          </div>
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5">
            <h3 className="text-sm font-semibold text-accent-yellow mb-3">Наше преимущество</h3>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p><span className="text-text-primary font-medium">Гарантия оригинала:</span> прямые договоры с Rolf, Sintec, KIXX, RhinOIL. Прозрачная цепочка: производитель &rarr; наш склад &rarr; клиент.</p>
              <p><span className="text-text-primary font-medium">CRM для ГСМ:</span> прогноз замены масла, корзина менеджера через WhatsApp, тиерные бонусы — ни у одного конкурента этого нет.</p>
              <p><span className="text-text-primary font-medium">B2B + B2C:</span> один магазин для автопарков (бочки 200л) и частных клиентов (канистры 5л).</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-text-muted mt-4">
          Источники: Autonews (контрафакт 54%), Коммерсант (43% онлайн), Logirus (маркировка &laquo;Честный знак&raquo;),
          Wikipedia/Forbes (выручка Exist, Emex), 5 Колесо (рейтинг магазинов), Data Insight (рост автотоваров +125%).
          Данные за 2024-2025.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          9. ЭКОНОМИКА ДОСТАВКИ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-2">
          Экономика доставки
        </h2>
        <p className="font-display text-lg md:text-xl text-text-primary mb-6">
          Два контура: Якутия + федеральный хаб
        </p>

        {/* Why hub is needed */}
        <div className="rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-5 mb-6">
          <h3 className="text-sm font-semibold text-accent-magenta mb-2">Почему нужен хаб вне Якутска</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Якутск — логистический тупик: нет ЖД, река Лена встаёт зимой (ледоход/ледостав — только авиация ×10 к цене),
            единственная федеральная трасса. Из Якутска можно обслуживать только Якутию.
            Для федеральных продаж нужен хаб в транспортном узле — <span className="text-text-primary font-medium">Новосибирск</span> (крупнейший
            логистический центр Сибири, все ТК, ЖД, ежедневные отправки).
          </p>
        </div>

        {/* Two tables side by side */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {/* Local: Yakutia */}
          <div>
            <h3 className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-3">Контур 1: Якутия (из Якутска)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2 px-3 text-text-muted font-medium">Маршрут</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">5 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">20 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">200 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">Срок</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-2 px-3 text-text-primary font-medium">По Якутии</td>
                    <td className="py-2 px-3 text-right">500-800 &#8381;</td>
                    <td className="py-2 px-3 text-right">~1 000 &#8381;</td>
                    <td className="py-2 px-3 text-right">4-5 тыс &#8381;</td>
                    <td className="py-2 px-3 text-right">2-5 дн.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-text-muted mt-2">ТК Энергия — уже работаем. СДЭК — для канистр.</p>
          </div>

          {/* Federal: from Novosibirsk hub */}
          <div>
            <h3 className="text-xs font-semibold text-accent-yellow uppercase tracking-wider mb-3">Контур 2: РФ (из хаба Новосибирск)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2 px-3 text-text-muted font-medium">Направление</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">5 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">20 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">200 л</th>
                    <th className="text-right py-2 px-3 text-text-muted font-medium">Срок</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-2 px-3 text-text-primary font-medium">Екатеринбург</td>
                    <td className="py-2 px-3 text-right">60-90 &#8381;</td>
                    <td className="py-2 px-3 text-right">220-320 &#8381;</td>
                    <td className="py-2 px-3 text-right">2-3 тыс &#8381;</td>
                    <td className="py-2 px-3 text-right">2-3 дн.</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-2 px-3 text-text-primary font-medium">Москва</td>
                    <td className="py-2 px-3 text-right">100-150 &#8381;</td>
                    <td className="py-2 px-3 text-right">360-540 &#8381;</td>
                    <td className="py-2 px-3 text-right">3,6-4,5 тыс &#8381;</td>
                    <td className="py-2 px-3 text-right">3-5 дн.</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-2 px-3 text-text-primary font-medium">Краснодар</td>
                    <td className="py-2 px-3 text-right">110-175 &#8381;</td>
                    <td className="py-2 px-3 text-right">400-630 &#8381;</td>
                    <td className="py-2 px-3 text-right">4-6 тыс &#8381;</td>
                    <td className="py-2 px-3 text-right">5-7 дн.</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-2 px-3 text-text-primary font-medium">Якутск</td>
                    <td className="py-2 px-3 text-right">225-310 &#8381;</td>
                    <td className="py-2 px-3 text-right">810-1 100 &#8381;</td>
                    <td className="py-2 px-3 text-right">8-11 тыс &#8381;</td>
                    <td className="py-2 px-3 text-right">8-10 дн.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Тарифы сборного груза. При партии 1-5 т — на 20-30% дешевле.</p>
          </div>
        </div>

        {/* Hub economics */}
        <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5 mb-6">
          <h3 className="text-sm font-semibold text-accent-yellow mb-3">Экономика хаба: Новосибирск vs Барнаул</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Аренда склада</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Новосибирск: <span className="text-text-primary font-medium">250-350 &#8381;/м²</span>.
                Барнаул: <span className="text-text-primary font-medium">150-220 &#8381;/м²</span> (на 40% дешевле, но +3,5 ч до транспортного узла).
                Якутск: 700-1 800 &#8381;/м² (в 3-6 раз дороже).
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Завоз от производителя</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Москва &rarr; Новосибирск: <span className="text-text-primary font-medium">13-30 &#8381;/кг</span>, 3-5 дн.
                Москва &rarr; Якутск: 35-69 &#8381;/кг, 12-20 дн. Экономия на завозе: <span className="text-accent-yellow font-medium">до ×2,5</span>.
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Рекомендация</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Новосибирск</span> — при масштабировании за пределы Якутии.
                Все ТК, ЖД, ежедневные отправки. Барнаул — резерв для удешевления хранения при больших объёмах (1 000+ м²).
              </p>
            </div>
          </div>
        </div>

        {/* Carriers */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-4">
            <h3 className="text-sm font-semibold text-accent-cyan mb-2">СДЭК</h3>
            <p className="text-xs text-text-secondary leading-relaxed">Канистры до 30 кг. Бесплатное API для расчёта стоимости в корзине. 38 000+ ПВЗ по России.</p>
          </div>
          <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-4">
            <h3 className="text-sm font-semibold text-accent-yellow mb-2">ТК Энергия</h3>
            <p className="text-xs text-text-secondary leading-relaxed">Бочки и крупный опт (20-200+ кг). 410 городов. Надёжный партнёр, уже работаем.</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Фастранс / СТЕИЛ</h3>
            <p className="text-xs text-text-secondary leading-relaxed">Сборные грузы из Новосибирска. Конкурентные тарифы на федеральные маршруты, 3-10 дн.</p>
          </div>
        </div>

        <p className="text-[10px] text-text-muted mt-4">
          Масло — только наземная доставка (не авиа). Тарифы СТЕИЛ, Фастранс, ТК Энергия, март 2026. Rolf/Sintec — производство Обнинск (Калужская обл.).
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          10. МАСШТАБИРОВАНИЕ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Масштабирование
        </h2>
        <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-6">
          <p className="text-xs text-text-secondary leading-relaxed mb-5 max-w-2xl">
            Двухконтурная модель: склад в Якутске обслуживает Якутию, хаб в Новосибирске — федеральные продажи.
            Для запуска нового региона нужен только договор с производителем и аренда склада. Платформа, CRM, бонусная система — уже готовы.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Два контура доставки</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Якутск &rarr; Якутия (ТК Энергия, 2-5 дн.). Новосибирск &rarr; вся РФ (СДЭК, Фастранс, СТЕИЛ, 2-10 дн.).
                Завоз от производителя в Новосибирск в 2,5 раза дешевле, чем в Якутск.
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
                Сайт, WhatsApp, Telegram, голосовой AI — все каналы через один API и одну БД.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent-yellow mb-2">Тиражируемая платформа</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Архитектура позволяет развернуть копию для другого дистрибьютора за дни, не месяцы. Каталог, бонусы, CRM — настраиваются, не переписываются.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          11. ПОД КАПОТОМ
      ═══════════════════════════════════════════════ */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Под капотом
        </h2>
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { value: '610', label: 'тестов', sub: '44 test suites' },
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
            { label: 'Оплата', value: 'ЮKassa production, банковские карты, СБП, SberPay, webhook' },
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
          12. CTA — ГОТОВЫ ЗАПУСТИТЬ?
      ═══════════════════════════════════════════════ */}
      <section className="mb-8">
        <div className="rounded-2xl border border-accent-yellow/30 bg-gradient-to-br from-accent-yellow/10 to-accent-yellow/5 p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl text-text-primary mb-3">
            Остались вопросы?
          </h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto mb-4 leading-relaxed">
            Свяжитесь с нами — поможем подобрать масло, рассчитаем объём
            для автопарка, организуем доставку по всей России.
          </p>

          {/* Phone numbers */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <a
              href="tel:+79969142832"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow px-6 py-3 text-sm font-bold text-bg-primary transition-all hover:shadow-[0_0_24px_rgba(255,214,0,0.3)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +7 (996) 914-28-32
              <span className="text-xs font-normal opacity-70">отдел продаж</span>
            </a>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
              <a href="tel:+79142744420" className="text-text-secondary hover:text-accent-yellow transition-colors">
                +7 (914) 274-44-20 <span className="text-text-muted text-xs">офис</span>
              </a>
              <a href="tel:+79141082051" className="text-text-secondary hover:text-accent-yellow transition-colors">
                +7 (914) 108-20-51 <span className="text-text-muted text-xs">руководитель</span>
              </a>
            </div>
          </div>

          {/* Address + socials */}
          <p className="text-text-muted text-xs mb-4">
            г. Якутск, ул. Лонгинова, 24/6, 2 этаж &middot; Пн–Пт 09:00–18:00
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/79969142832"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 px-6 py-3 text-sm font-medium text-green-400 transition-colors hover:border-green-400 hover:bg-green-500/10"
            >
              WhatsApp
            </a>
            <a
              href="https://t.me/alltech14_ykt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-cyan hover:text-accent-cyan"
            >
              Telegram
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
