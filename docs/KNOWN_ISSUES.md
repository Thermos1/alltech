# KNOWN_ISSUES.md — АЛТЕХ Store

> Активные баги и проблемы. Каждая запись содержит root cause и статус.

## Открытые

### 1. Изображения товаров — плейсхолдеры вместо реальных фото

- **Описание**: Карточки товаров показывают инициалы (RK, ХМ и т.д.) вместо реальных фото
- **Root cause**: Реальные PNG-иконки есть в `docs/Иконки финал/` (по брендам), но не загружены в Supabase Storage и не привязаны к `products.image_url`
- **Fix**: Загрузить в Supabase Storage bucket `product-images/`, обновить `image_url` в БД
- **Приоритет**: Высокий

### 2. Supabase типы не сгенерированы

- **Описание**: TypeScript типы из Supabase не сгенерированы, используются `any` casts для join-ов (brands, product_variants)
- **Root cause**: Не запущен `supabase gen types typescript`
- **Fix**: `supabase gen types typescript --linked > src/types/database.ts`, затем типизировать запросы
- **Приоритет**: Средний

### 3. Coolify API token read-only

- **Описание**: Первый токен (`2|...`) имеет только read-доступ. Для деплоя нужен write-токен (`3|...`)
- **Root cause**: Токен создан с ограниченными правами на http://94.247.130.164:8000/security/api-tokens
- **Fix**: Использовать write-токен `3|Q0uWpHphaUL6GBFRAeVkc8E6TpbNrMPbmbDIyIu2e2de259b`
- **Приоритет**: Низкий (обходное решение найдено)

## Закрытые

*Пока нет закрытых issues.*

---

*Последнее обновление: 2026-02-27*
