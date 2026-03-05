# CONTEXT.md — АЛТЕХ Store

> Источник правды: состояние проекта, инфраструктура, решения.
> Обновлять после каждого значимого изменения.

## Статус проекта

**Фаза**: Production — полнофункциональный e-commerce
**Дата**: 2026-03-05

### Что сделано

#### Core E-commerce
- [x] Next.js 15 + TypeScript + Tailwind v4 (App Router, standalone output)
- [x] Supabase проект (tylxmgxmsyegqcdfyxsp, eu-central-1)
- [x] Каталог: 10 брендов, 12 категорий, 47 товаров, 73 варианта с реальными PNG в Supabase Storage
- [x] Карточка товара: изображения, варианты (объём/ед./цена), спеки (API, ACEA, тип базы), add to cart
- [x] Корзина: Zustand v5 с persist middleware, localStorage, SSR hydration guard
- [x] Checkout: валидация форм (Zod), промокоды, бонусы, создание заказа
- [x] ЮKassa payment: реальный API (POST /v3/payments), **production магазин** (Shop ID 1291070), webhook
- [x] Управление заказами: номера (ALT-YYYY-XXXX), статусы, история

#### Auth & Users
- [x] Customer auth: SMS OTP через SMS.ru (реальные SMS, Latin text, sender "Good Remont", /login)
- [x] Staff auth: email/password через Supabase Auth (/admin-login)
- [x] RBAC: admin, manager, customer — RLS + middleware
- [x] Middleware: protected routes, smart redirects по ролям
- [x] Staff SMS redirect: менеджеры через /login → автоматически в /admin

#### Личный кабинет (/cabinet)
- [x] Дашборд: приветствие, бонусный баланс, реферальный код, последние заказы
- [x] Список заказов со статус-бейджами
- [x] Детали заказа с позициями
- [x] Настройки профиля (имя, телефон, компания, ИНН)

#### Бонусная система
- [x] Tiered cashback: Старт 3% → Бронза 5% → Серебро 7% → Золото 10% → Платина 15%
- [x] Повышение уровня по накопительной сумме покупок
- [x] Списание бонусов (макс 30% от суммы заказа)
- [x] Реферальные коды: 500 бонусов рефереру при первой покупке приведённого

#### Промокоды
- [x] Процентные и фиксированные скидки
- [x] Дата, лимит использований, минимальная сумма
- [x] Тестовые коды: WELCOME10 (10%), АЛТЕХ500 (500₽)

#### Админ-панель (/admin) — 14 секций admin, 5 manager
- [x] Dashboard: заказы, выручка, новые заказы (admin); заказы, оплаченные, комиссия (manager)
- [x] Обратный отсчёт замены масла на дашборде и карточке клиента
- [x] Заказы: таблица с фильтром по статусу + dropdown изменения статуса
- [x] Клиенты: поиск, фильтр по менеджеру/статусу, заметки, прогноз замены масла, WhatsApp
- [x] Менеджеры: добавление/редактирование, ставки комиссии, выручка
- [x] Комиссии (/admin/commissions): лог по заказам, группировка по месяцам
- [x] Промокоды (/admin/promo): CRUD, toggle active, safe delete
- [x] Корзины (/admin/shared-cart): менеджер → ссылка → WhatsApp → клиент
- [x] Склад (/admin/stock): таблица вариантов, цветовая индикация, inline-editing, auto-deduction
- [x] Аналитика (/admin/analytics): выручка по месяцам, средний чек, топ товаров/клиентов
- [x] Журнал (/admin/activity): audit trail
- [x] Товары, Бренды, Категории — read-only с изображениями
- [x] **Карточки** (/admin/image-tools): генератор карточек — удаление фона (browser WASM @imgly/background-removal) + AI-распознавание характеристик (Claude Vision API)

#### SIPmind API
- [x] search-products, check-stock, create-order (Bearer token auth)

#### Безопасность
- [x] Server-side price verification
- [x] Payment webhook idempotency
- [x] HTTP security headers (HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy)
- [x] Atomic promo code usage (optimistic lock)
- [x] Self-referral prevention

#### Юридические страницы
- [x] /privacy, /terms, /offer, /returns (ЮKassa-ready)

#### /about — бизнес-презентация (12 секций)
- [x] Unit Economics, Product Decisions, Modules, Onboarding, Test Accounts
- [x] Market Analytics (TAM ~200 млрд), Delivery Economics, Scaling
- [x] Credits: techdab.net + sipmind.net

#### Image Tools (/admin/image-tools) — 4 таба
- [x] Очистка (LaMa ONNX inpainting, 208MB, browser WASM) — убирает объекты с фото
- [x] Удаление фона (@imgly/background-removal, browser WASM)
- [x] Карточка товара: 4 стиля (retro, minimalist, premium-dark, +carousel), 7 платформ (WB/Ozon, Shopify, Instagram, Telegram/VK, TikTok, Pinterest, Custom), Satori+Sharp+pdf-lib
- [x] Карусель: 7 слайдов, PNG/PDF, AI-заполнение через Claude API
- [x] AI-распознавание характеристик (Claude Vision API)
- [x] Slide Buffer: карточки → буфер → доступны в карусели
- [x] Универсальная модель: ProductSpec[] для любой ниши, кастомные цвета, слайдер размера фото

#### Тесты
- [x] 610+ unit tests (Vitest), 44 suites, 100% API route coverage (34 routes)
- [x] E2E тесты: 4 спеки (Playwright) — auth, catalog, pages, cart-checkout

#### Инфраструктура
- [x] Docker standalone build, Coolify на PS.KZ VPS
- [x] GitHub Actions auto-deploy on push to main
- [x] Weekly cron: docker prune + journalctl vacuum

### Что следующее

- [x] ЮKassa production — подключена, работает
- [ ] ЮKassa HMAC webhook signature verification (безопасность)
- [ ] SMS.ru: sender "Alteh" создан, регистрация Билайн/МТС/Мегафон в процессе. Dev mode (devCode показывается на экране)
- [ ] СДЭК API интеграция (доставка — сделано в online-trade, можно перенести)
- [ ] Product CRUD в admin (сейчас read-only)
- [ ] Подбор фильтров по авто (FAW, SITRAK, HOWO, SHACMAN, HINO)
- [ ] SEO: generateMetadata, JSON-LD, sitemap.xml
- [ ] Яндекс.Метрика
- [ ] 1С интеграция (bidirectional sync)
- [ ] WhatsApp chat-bot (ссылка корзины менеджера работает, полноценный бот — нет)

## Инфраструктура

### Supabase

| Параметр | Значение |
|----------|---------|
| Проект ID | `tylxmgxmsyegqcdfyxsp` |
| Регион | eu-central-1 |
| URL | https://tylxmgxmsyegqcdfyxsp.supabase.co |
| Anon Key | `eyJ...NQMVc...92Q` (в .env.local) |
| Service Role Key | `eyJ...ZcC1V...FSo` (в .env.local) |
| DB Password | `AlTech2026SecureDBx9k` |
| Supabase Access Token | `sbp_b723d333ecd83071fe7385787132518b3f5beba3` |

### Coolify (PS.KZ сервер)

| Параметр | Значение |
|----------|---------|
| Сервер | 94.247.130.164 |
| SSH | `ssh ubuntu@94.247.130.164` (пароль: `AP1uY40ZgqVPCeLt6Qz5APE=`) |
| Coolify UI | http://94.247.130.164:8000 |
| API Token (read) | `2\|pgfEiE6QWacZN765m1Z6CZtQIaJKwCBjBiKYhBp6c6b9324d` |
| API Token (write) | `3\|Q0uWpHphaUL6GBFRAeVkc8E6TpbNrMPbmbDIyIu2e2de259b` |
| Проект UUID | `hk0kk8c4go0k8ogccwo0sko4` |
| App UUID | `l04k0oo4oc8sg8g88gcc4g44` |
| Домен | `https://altehspec.ru` (SSL Let's Encrypt) |

### SMS.ru (SMS OTP)

| Параметр | Значение |
|----------|---------|
| API ID | `7FF81873-1D80-9362-9492-008596DF3FD8` |
| Sender | `Good Remont` (ООО "Умный ремонт") |
| Баланс | ~580₽ (8.80₽/SMS) |
| Текст OTP | `ALTEH: Vash kod: XXXX` (Latin — Cyrillic блокируется спам-фильтром) |

### ЮKassa (Payment)

| Параметр | Значение |
|----------|---------|
| Shop ID | `1291070` |
| Secret Key (test) | `test_9KJK8Wkb2V5yh4xEMvgLWi11zYWzigzlalwgudJlIIE` |
| Webhook URL | `https://altehspec.ru/api/payment/webhook` |
| Events | payment.succeeded, payment.waiting_for_capture, payment.canceled, refund.succeeded |
| Mode | **Production** — подключена и работает |

### Рег.ру (Domain)

| Параметр | Значение |
|----------|---------|
| Домен | `altehspec.ru` |
| DNS | A-record → 94.247.130.164 |
| SSL | Let's Encrypt (auto-renew via Coolify/Traefik) |
| Доступ | Alltech.dv@gmail.com / Levaf2015 |

### GitHub

| Параметр | Значение |
|----------|---------|
| Репо | https://github.com/Thermos1/alltech |
| Видимость | **private** (переключено 2026-03-05) |
| Branch | main |
| Deploy key | ED25519 `coolify-altech-deploy` |

### Тестовые аккаунты

**Staff (email/password через /admin-login):**
| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@altech-store.ru | admin2025 |
| Manager | manager@altech-store.ru | manager2025 |

**Покупатели (SMS OTP через /login):**
| Телефон | Имя |
|---------|-----|
| +7 900 111-11-11 | Иванов Алексей |
| +7 900 444-44-44 | Петрова Мария |
| +7 900 555-55-55 | Сидоров Дмитрий |

## Контакты компании

- **Компания**: ООО «АЛТЕХ»
- **ОГРН**: 1221400010182
- **ИНН**: 1400013380
- **Слоган**: Родом из Якутии
- **Телефоны**: +7 (924) 171-61-22, +7 (914) 274-44-20
- **Email**: Alltech.dv@gmail.com
- **Telegram**: alltech14_ykt
- **Instagram**: alltech.14
- **Сайт**: altehspec.ru
- **Город**: Якутск, Якутия, Россия

### Что продают

- Официальный дистрибьютор: ROLF, SINTEC, TAKAYAMA, KIXX, RHINOIL, ХИМАВТО
- Официальный дилер китайской техники SHANBO
- Дизельные генераторы (Cummins, Weichai + Leroy Somer, Stamford)
- Фильтры на SHACMAN, HOWO, FAW, SITRAK, HINO
- Бесплатная доставка по Якутску

## Архитектурные решения

1. **Next.js standalone output** — для Docker, минимальный образ
2. **Supabase как BaaS** — auth, PostgreSQL, storage, RLS, без кастомного бэкенда
3. **Zustand + localStorage** — корзина работает без авторизации, синхронизируется при логине
4. **Product variants** — отдельная таблица для объёмов/упаковок (200л, 20л, розлив)
5. **Vehicle compatibility** — junction table для подбора фильтров по технике
6. **Coolify на PS.KZ** — хостинг на сервере Allergoscreen
7. **Route groups** — (shop), (cabinet), (admin), (auth) — изолированные layouts
8. **Three Supabase clients** — anon (browser), server (SSR cookies), admin (service role)
9. **RLS + SECURITY DEFINER** — `get_my_role()` функция предотвращает бесконечную рекурсию
10. **RBAC** — admin, manager, customer — на уровне БД (RLS) + middleware
11. **Fail-open** — внешний сервис недоступен → платформа продолжает работать

## Env Variables (production Coolify)

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
YOOKASSA_SHOP_ID=1291070, YOOKASSA_SECRET_KEY=test_9KJK8...
SMS_RU_API_KEY=7FF81873-...
SIPMIND_API_SECRET=altech-sipmind-secret-2026
ANTHROPIC_API_KEY=... (для AI-распознавания характеристик товаров в /admin/image-tools)
NEXT_PUBLIC_APP_URL=https://altehspec.ru
```

## БД (8 миграций)

- `001_initial_schema.sql` — базовые таблицы
- `002_rls_policies.sql` — RLS-политики
- `003_bonus_tiers.sql` — tiered бонусная система
- `004_promo_codes.sql` — промокоды
- `005_crm_fields.sql` — CRM поля (manager_id, commission_rate и т.д.)
- `006_checkout_validation.sql` — валидация checkout
- `007_commission_log.sql` — лог комиссий
- `008_crm_enhancements.sql` — client_notes, activity_log, shared_carts, decrement_stock()

---

*Последнее обновление: 2026-03-05*
