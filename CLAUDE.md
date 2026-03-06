# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Первым делом

1. Прочитай `CONTEXT.md` — текущий статус, инфраструктура, что сделано и что следующее
2. Прочитай этот файл — правила и архитектура
3. Проверь `docs/KNOWN_ISSUES.md` — активные баги

## Команды

```bash
# Dev
npm run dev                    # Запуск dev-сервера (http://localhost:3000)
npm run build                  # Production build (standalone)
npm run lint                   # ESLint

# Supabase
export SUPABASE_ACCESS_TOKEN=sbp_b723d333ecd83071fe7385787132518b3f5beba3
supabase db push --linked      # Применить миграции к удалённому Supabase
supabase gen types typescript --linked > src/types/database.ts  # Сгенерировать типы

# Deploy (Coolify на PS.KZ)
git push origin main           # Coolify автодеплоит (если настроен webhook)
# Или ручной деплой:
curl -X POST -H "Authorization: Bearer 3|Q0uWpHphaUL6GBFRAeVkc8E6TpbNrMPbmbDIyIu2e2de259b" \
  "http://94.247.130.164:8000/api/v1/applications/l04k0oo4oc8sg8g88gcc4g44/start"
```

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS v4 |
| UI/анимации | Framer Motion, CSS neon effects |
| Backend/БД | Supabase (Auth, PostgreSQL, Storage, RLS) |
| Платежи | ЮKassa (production, Shop ID 1289971, НДС 22%) |
| Стейт | Zustand (корзина с localStorage persist) |
| Валидация | Zod |
| Шрифты | Dela Gothic One (display, cyrillic), Golos Text (body, cyrillic) |
| Деплой | Docker standalone → Coolify (94.247.130.164) |

## Дизайн-тема

Ретро-футуризм, постеры фильмов 80-90х (Терминатор, Робокоп). Референсы: `docs/Общее.jpg`, `docs/Масло34.jpg`.

### Цвета (CSS переменные в globals.css)

- `--bg-primary: #0A0A0F` — основной фон
- `--bg-card: #1A1A25` — карточки
- `--accent-yellow: #FFD600` — основной акцент (кнопки, цены, CTA)
- `--accent-cyan: #00E5FF` — вторичный (вязкость, бренды)
- `--accent-magenta: #FF2D78` — третичный (промо-бейджи)

### Tailwind классы

Все кастомные цвета доступны как: `bg-bg-primary`, `text-accent-yellow`, `border-border-subtle` и т.д.
Определены через `@theme inline` в `globals.css`.

### CSS-утилиты

- `.neon-yellow`, `.neon-cyan` — text-shadow neon glow
- `.glow-border-yellow` — box-shadow glow on hover
- `.scan-lines` — CRT scan line overlay (::after)
- `.grid-pattern` — фоновая сетка
- `.no-scrollbar` — скрытый scrollbar
- `.carousel-fade-both` — gradient fade для каруселей

## Архитектура

### Маршрутизация (App Router)

```
src/app/
├── (shop)/          # Публичный магазин (Header + Footer + MobileNav + ChatFab)
│   ├── page.tsx     # Главная (/)
│   ├── catalog/[section]/[category]/  # Каталог
│   ├── product/[slug]/                # Карточка товара
│   ├── cart/                          # Корзина
│   ├── checkout/                      # Оформление (TODO)
│   └── filters/                       # Подбор по авто (TODO)
├── (auth)/          # Авторизация (SMS OTP customers, email/password staff)
├── (cabinet)/       # Личный кабинет (заказы, бонусы, реферал, настройки)
├── (admin)/         # Админ-панель (14 секций admin, 5 manager)
│   └── admin/image-tools/  # Image Tools (4 таба: очистка, фон, карточки, карусели)
└── api/             # 34 API routes (все покрыты тестами)
```

### Supabase клиенты

- `src/lib/supabase/client.ts` — browser client (createBrowserClient)
- `src/lib/supabase/server.ts` — server component client (createServerClient + cookies)
- `src/lib/supabase/admin.ts` — service_role client (API routes only)

### Корзина

Zustand store: `src/stores/cart-store.ts`, persist middleware → localStorage key `altech-cart`.
Hook: `src/hooks/useCart.ts`.
Работает без авторизации. При логине — синхронизация с `cart_items` таблицей (TODO).

### Каталог

Два раздела: `lubricants` (масла) и `filters` (фильтры).
Продукт имеет варианты (product_variants) — объём/упаковка с ценой.
URL: `/catalog/{section}`, `/catalog/{section}/{category}`, `/product/{slug}`.

**Homepage = каталог**: главная страница рендерит полный каталог обоих секций с CategoryTabs и BrandFilter.
Порядок: PopularProducts (слайдер) → CatalogSection lubricants → CatalogSection filters → ValueProps.
CatalogSection — серверный компонент в `page.tsx`, переиспользует FilterableProductGrid и CategoryTabs.

### Изображения товаров

Реальные иконки продуктов в `docs/Иконки финал/` — организованы по брендам.
TODO: загрузить в Supabase Storage и привязать к product.image_url.

## Правила

- Русский для обсуждений, английский для кода
- Коммит только по запросу, с `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- `git add` конкретные файлы, не `-A`
- Читай код перед изменением
- Обновляй CONTEXT.md после значимых изменений
- Mobile-first дизайн (375px как минимум)
- Все тексты на русском языке

## Тесты

- **620 unit tests** (Vitest), **46 suites**, 100% API route coverage (34 routes)
- **48 E2E tests** (Playwright) — production тесты на altehspec.ru
- Запуск unit: `npx vitest run`
- Запуск E2E: `npx playwright test` (требует запущенный сервер или E2E_BASE_URL)
- Тесты мокают Supabase — никакой зависимости от реальной БД

## Image Tools (/admin/image-tools)

4 таба:
1. **Очистка** — LaMa ONNX inpainting (208MB, HuggingFace CDN, browser WASM)
2. **Удаление фона** — @imgly/background-removal (browser WASM)
3. **Карточка** — генератор карточек (4 стиля × 7 платформ, Satori+Sharp+pdf-lib)
4. **Карусель** — 7 слайдов, PNG/PDF, AI-заполнение через Claude API

Ключевые файлы:
- `src/lib/card-generator.ts` — генерация (Satori→SVG→Sharp→PNG)
- `src/lib/card-templates/` — стили и пресеты платформ
- `src/lib/ai-carousel.ts` — AI-генерация контента для слайдов
- `src/lib/lama-inpainter.ts` — LaMa ONNX wrapper
- `src/lib/image-processing.ts` — Claude Vision AI-распознавание
- `src/app/(admin)/admin/image-tools/` — UI компоненты
