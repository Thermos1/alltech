/**
 * AI product recognition via Claude Vision API.
 * Analyzes product photos to extract specs from labels.
 *
 * When ANTHROPIC_API_KEY is not set, returns null (dev mode).
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export type RecognizedProduct = {
  brand?: string;
  viscosity?: string;
  base_type?: 'synthetic' | 'semi_synthetic' | 'mineral';
  api_spec?: string;
  acea_spec?: string;
  approvals?: string;
  oem_number?: string;
  volume?: string;
  description?: string;
};

export async function recognizeProduct(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<RecognizedProduct | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log('[IMAGE] Dev mode: ANTHROPIC_API_KEY not set, skipping recognition');
    return null;
  }

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
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analyze this product photo (motor oil, lubricant, or automotive filter).
Extract ALL information visible on the label/packaging.

Return ONLY valid JSON with these fields (omit fields you cannot determine):
{
  "brand": "Brand name (e.g. ROLF, KIXX, Sintec)",
  "viscosity": "SAE viscosity grade (e.g. 5W-40, 10W-40)",
  "base_type": "synthetic" | "semi_synthetic" | "mineral",
  "api_spec": "API classification (e.g. SN/CF, CI-4/SL)",
  "acea_spec": "ACEA classification (e.g. A3/B4, E7)",
  "approvals": "OEM approvals (e.g. MB 229.5; VW 502.00/505.00)",
  "oem_number": "OEM part number if visible",
  "volume": "Container volume (e.g. 1л, 4л, 20л, 200л)",
  "description": "Brief product description in Russian (1-2 sentences)"
}

Important: Return ONLY the JSON object, no markdown, no code blocks, no explanation.`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[IMAGE] Claude API error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('[IMAGE] No text in Claude response');
      return null;
    }

    // Parse JSON from response (handle possible markdown code blocks)
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonStr) as RecognizedProduct;

    // Validate base_type
    if (parsed.base_type && !['synthetic', 'semi_synthetic', 'mineral'].includes(parsed.base_type)) {
      delete parsed.base_type;
    }

    console.log('[IMAGE] Recognized:', JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    console.error('[IMAGE] Recognition error:', error);
    return null;
  }
}
