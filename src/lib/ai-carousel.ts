/**
 * AI carousel content generation via Claude API.
 * Takes product info and generates marketing copy for carousel slides.
 *
 * When ANTHROPIC_API_KEY is not set, returns null (dev mode).
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export type AiCarouselInput = {
  productName: string;
  productDescription?: string;
  brand?: string;
  specs?: { label: string; value: string }[];
  category?: string;
};

export type AiCarouselResult = {
  benefits: string[];
  compatibility: string[];
  usageTips: string[];
  certifications: string[];
};

export async function generateCarouselContent(
  input: AiCarouselInput,
): Promise<AiCarouselResult | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log('[AI-CAROUSEL] Dev mode: ANTHROPIC_API_KEY not set');
    return null;
  }

  const specsText = input.specs?.length
    ? input.specs.map((s) => `${s.label}: ${s.value}`).join(', ')
    : 'не указаны';

  const prompt = `Ты — эксперт по маркетингу товаров для маркетплейсов (WB, Ozon, Shopify).
Для товара "${input.productName}"${input.brand ? ` (${input.brand})` : ''}${input.category ? `, категория: ${input.category}` : ''} сгенерируй продающий контент для карусели из 7 слайдов.

Характеристики: ${specsText}
${input.productDescription ? `Описание: ${input.productDescription}` : ''}

Верни ТОЛЬКО валидный JSON:
{
  "benefits": ["4-6 коротких конкретных преимуществ, каждое до 100 символов"],
  "compatibility": ["4-8 моделей/сценариев совместимости или применения"],
  "usageTips": ["3-5 практических советов по использованию"],
  "certifications": ["2-4 сертификации или гарантии качества"]
}

Правила:
- Текст на русском языке
- Преимущества конкретные, не общие фразы типа "высокое качество"
- Совместимость: если масло — марки авто, если фильтр — модели, если другое — сценарии применения
- Сертификации: реальные стандарты из характеристик, если нет — общие ("Оригинальная продукция", "Сертификат соответствия")
- Каждый пункт — отдельная фраза, без нумерации
- Верни ТОЛЬКО JSON, без markdown, без code blocks`;

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
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[AI-CAROUSEL] Claude API error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('[AI-CAROUSEL] No text in Claude response');
      return null;
    }

    // Parse JSON (handle possible markdown code blocks)
    const jsonStr = text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    const parsed = JSON.parse(jsonStr) as AiCarouselResult;

    // Validate arrays
    if (!Array.isArray(parsed.benefits)) parsed.benefits = [];
    if (!Array.isArray(parsed.compatibility)) parsed.compatibility = [];
    if (!Array.isArray(parsed.usageTips)) parsed.usageTips = [];
    if (!Array.isArray(parsed.certifications)) parsed.certifications = [];

    console.log('[AI-CAROUSEL] Generated:', JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    console.error('[AI-CAROUSEL] Generation error:', error);
    return null;
  }
}
