/**
 * AI slide plan generation via Claude API.
 * Takes user prompt + image count → returns structured slide sequence.
 *
 * When ANTHROPIC_API_KEY is not set, returns null (503 to client).
 */

import type { CarouselSlideType, AiSlide } from './card-templates/carousel';
import type { CardStyleId, ProductSpec } from './card-templates/types';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export type AiPlanInput = {
  prompt: string;
  imageCount: number;
  style?: string;
  platform?: string;
};

export type AiPlan = {
  slides: AiSlide[];
  style: CardStyleId;
  productData?: {
    name: string;
    brand?: string;
    subtitle?: string;
    specs?: ProductSpec[];
  };
};

const AVAILABLE_TYPES: { type: CarouselSlideType; description: string }[] = [
  { type: 'cover', description: 'Обложка товара — фото + название + бренд. Требует imageIndex.' },
  { type: 'specs', description: 'Характеристики товара — таблица параметров. Используй items как "Параметр: Значение".' },
  { type: 'benefits', description: 'Преимущества — список буллетов. Используй items.' },
  { type: 'compatibility', description: 'Совместимость — модели авто, устройства, сценарии. Используй items.' },
  { type: 'volumes', description: 'Варианты и цены — фасовки, объёмы.' },
  { type: 'usage', description: 'Применение — советы по использованию. Используй items.' },
  { type: 'trust', description: 'Гарантия качества — сертификаты, стандарты. Используй items.' },
  { type: 'photo-only', description: 'Только фото на весь слайд. Требует imageIndex. Без текста.' },
  { type: 'photo-text', description: 'Фото на весь слайд + текст поверх на полупрозрачной плашке. Требует imageIndex + heading/body.' },
  { type: 'text-only', description: 'Текст/цитата/тезис на цветном фоне. heading + body. Без фото.' },
  { type: 'title', description: 'Заголовочный слайд — крупный акцентный текст. heading + body (подзаголовок).' },
  { type: 'list', description: 'Универсальный список с буллетами. heading + items.' },
];

export async function generateAiPlan(input: AiPlanInput): Promise<AiPlan | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log('[AI-PLAN] Dev mode: ANTHROPIC_API_KEY not set');
    return null;
  }

  const typesDescription = AVAILABLE_TYPES.map(
    (t) => `  - "${t.type}": ${t.description}`,
  ).join('\n');

  const prompt = `Ты — эксперт по созданию визуального контента для маркетплейсов (WB, Ozon, Shopify) и социальных сетей (LinkedIn, Instagram, Telegram).

Пользователь хочет создать последовательность слайдов (карусель). Вот его запрос:

"${input.prompt}"

Количество загруженных фото: ${input.imageCount}
${input.style ? `Предпочтительный стиль: ${input.style}` : ''}
${input.platform ? `Платформа: ${input.platform}` : ''}

Доступные типы слайдов:
${typesDescription}

Правила:
1. Количество слайдов: если пользователь указал — следуй. Если нет — от 5 до 10.
2. Если есть фото (imageCount > 0) — используй их. imageIndex: 0 для первого фото, 1 для второго и т.д.
3. Не ссылайся на фото, которых нет (imageIndex < imageCount).
4. Для товарных каруселей: начни с cover/photo-only, затем specs/benefits/compatibility, заверши trust.
5. Для контентных каруселей (LinkedIn, мысли, тезисы): начни с title, затем text-only/list, заверши CTA.
6. Текст на русском языке.
7. Каждый items[] — массив строк (буллеты), heading — заголовок, body — основной текст.
8. Выбери style из: minimalist, premium-dark, gradient, retro. Для товаров — minimalist/premium-dark. Для контента — gradient/premium-dark.
9. Если в запросе есть данные о товаре — заполни productData (name, brand, specs).

Верни ТОЛЬКО валидный JSON:
{
  "slides": [
    { "type": "cover", "imageIndex": 0, "heading": "Название" },
    { "type": "benefits", "heading": "Преимущества", "items": ["...", "..."] },
    { "type": "text-only", "heading": "Заголовок", "body": "Текст..." }
  ],
  "style": "premium-dark",
  "productData": {
    "name": "Название товара",
    "brand": "Бренд",
    "specs": [{ "label": "Параметр", "value": "Значение" }]
  }
}

Верни ТОЛЬКО JSON, без markdown, без code blocks, без пояснений.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[AI-PLAN] Claude API error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('[AI-PLAN] No text in Claude response');
      return null;
    }

    // Parse JSON (handle possible markdown code blocks)
    const jsonStr = text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    const parsed = JSON.parse(jsonStr) as AiPlan;

    // Validate structure
    if (!Array.isArray(parsed.slides)) parsed.slides = [];

    // Validate each slide
    parsed.slides = parsed.slides.map((slide) => {
      const clean: AiSlide = { type: slide.type || 'text-only' };
      if (slide.imageIndex != null && slide.imageIndex < input.imageCount) {
        clean.imageIndex = slide.imageIndex;
      }
      if (slide.heading) clean.heading = String(slide.heading).slice(0, 200);
      if (slide.body) clean.body = String(slide.body).slice(0, 1000);
      if (Array.isArray(slide.items)) {
        clean.items = slide.items.map((item) => String(item).slice(0, 300));
      }
      return clean;
    });

    // Validate style
    const validStyles: CardStyleId[] = ['minimalist', 'premium-dark', 'gradient', 'retro'];
    if (!validStyles.includes(parsed.style)) {
      parsed.style = 'premium-dark';
    }

    console.log('[AI-PLAN] Generated plan:', parsed.slides.length, 'slides');
    return parsed;
  } catch (error) {
    console.error('[AI-PLAN] Generation error:', error);
    return null;
  }
}
