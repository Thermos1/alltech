# CONTEXT.md — АЛТЕХ Store

> Источник правды: состояние проекта, инфраструктура, решения.
> Обновлять после каждого значимого изменения.

## Статус проекта

**Фаза**: MVP (Фаза 1 — каталог + корзина) задеплоен на Coolify
**Дата**: 2026-02-27

### Что сделано

- [x] Next.js 15 + TypeScript + Tailwind v4 (App Router, standalone output)
- [x] Supabase проект создан (tylxmgxmsyegqcdfyxsp, eu-central-1)
- [x] Схема БД: brands, categories, products, product_variants, profiles, orders, order_items, cart_items, promo_codes, banners, vehicle_brands/models/engine_models, product_vehicle_compatibility, referral_events
- [x] RLS-политики для всех таблиц
- [x] Сид-данные: 7 брендов, 10 категорий, 35+ продуктов с вариантами (ROLF, KIXX, ХИМАВТО, RhinOIL, Sintec, Volga)
- [x] Ретро-футуристический дизайн (неон, тёмный фон, стиль постеров 80-90х)
- [x] Шрифты: Dela Gothic One (заголовки) + Golos Text (текст), кириллица
- [x] Главная страница: Hero, BrandCarousel, SectionChooser, ValueProps
- [x] Каталог: /catalog/[section] и /catalog/[section]/[category]
- [x] Карточка товара: /product/[slug] с VolumeSelector
- [x] Корзина: Zustand + localStorage, CartDrawer
- [x] Layout: Header, MobileNav, Footer, ChatFab (WhatsApp)
- [x] Dockerfile (standalone build) + деплой на Coolify PS.KZ
- [x] GitHub: https://github.com/Thermos1/alltech (публичный)

### Что следующее

- [ ] Подключить реальные изображения товаров (docs/Иконки финал/) → Supabase Storage
- [ ] Auth: Supabase Auth (телефон OTP + email)
- [ ] Checkout + ЮKassa оплата (аккаунт ещё не создан)
- [ ] Личный кабинет (история заказов, профиль)
- [ ] Подбор фильтров по авто (FAW, SITRAK, HOWO, SHACMAN, HINO)
- [ ] Акции, промокоды, бонусная программа, реферальная система
- [ ] Админ-панель (CRUD товаров, заказов, баннеров)
- [ ] SEO: generateMetadata, JSON-LD, sitemap.xml
- [ ] Яндекс.Метрика
- [ ] AI-виджет (SIPmind интеграция)

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
| Домен | `http://l04k0oo4oc8sg8g88gcc4g44.94.247.130.164.sslip.io` |

### GitHub

| Параметр | Значение |
|----------|---------|
| Репо | https://github.com/Thermos1/alltech |
| Видимость | public (для Coolify deploy) |
| Branch | main |
| Deploy key | ED25519 `coolify-altech-deploy` (добавлен через gh CLI) |

## Контакты компании

- **Компания**: АЛТЕХ (ООО)
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
6. **Coolify на PS.KZ** — временный хостинг на сервере Allergoscreen

---

*Последнее обновление: 2026-02-27*
