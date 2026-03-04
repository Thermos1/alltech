import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod/v4';
import { generateCard, generateCarousel, generateCarouselPdf } from '@/lib/card-generator';
import type { CardConfig } from '@/lib/card-templates';
import type { CarouselData } from '@/lib/card-templates/carousel';

const specSchema = z.object({
  label: z.string().max(100),
  value: z.string().max(200),
});

const cardGenerateSchema = z.object({
  mode: z.enum(['card', 'carousel']),
  style: z.enum(['minimalist', 'premium-dark', 'gradient', 'retro']),
  platform: z.enum(['wb-ozon', 'shopify', 'instagram', 'telegram-vk', 'tiktok', 'pinterest', 'custom']),
  customWidth: z.number().int().min(200).max(4000).optional(),
  customHeight: z.number().int().min(200).max(4000).optional(),
  enabledElements: z.array(z.string()),
  badges: z.array(z.object({
    text: z.string().max(30),
    type: z.enum(['hit', 'new', 'sale', 'custom']),
  })).max(5),
  productData: z.object({
    name: z.string().min(1).max(200),
    brand: z.string().max(50).optional(),
    price: z.number().min(0).optional(),
    priceUnit: z.string().max(5).optional(),
    subtitle: z.string().max(50).optional(),
    specs: z.array(specSchema).max(20).default([]),
    description: z.string().max(2000).optional(),
  }),
  productImageBase64: z.string().min(1),
  imageScale: z.number().min(0.2).max(0.95).optional(),
  customColors: z.record(z.string(), z.string()).optional(),
  watermarkImageBase64: z.string().optional(),
  carouselData: z.object({
    benefits: z.array(z.string().max(200)).max(8).optional(),
    compatibility: z.array(z.string().max(100)).max(12).optional(),
    volumes: z.array(z.object({
      volume: z.string(),
      price: z.number(),
    })).max(10).optional(),
    usageTips: z.array(z.string().max(300)).max(8).optional(),
    certifications: z.array(z.string().max(200)).max(8).optional(),
  }).optional(),
  outputFormat: z.enum(['png', 'jpg', 'pdf']).default('png'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = cardGenerateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: parseResult.error.issues },
        { status: 400 },
      );
    }

    const config = parseResult.data;

    if (config.mode === 'card') {
      const buffer = await generateCard(config as unknown as CardConfig);
      const isJpg = config.outputFormat === 'jpg';
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': isJpg ? 'image/jpeg' : 'image/png',
          'Content-Disposition': `attachment; filename="card-${Date.now()}.${isJpg ? 'jpg' : 'png'}"`,
        },
      });
    }

    if (config.mode === 'carousel') {
      const cd = config.carouselData || {};
      const carouselData: CarouselData = {
        product: config.productData,
        benefits: cd.benefits || ['Высокое качество', 'Выгодные условия', 'Быстрая доставка'],
        compatibility: cd.compatibility || [],
        volumes: cd.volumes || [],
        usageTips: cd.usageTips || ['Ознакомьтесь с инструкцией'],
        certifications: cd.certifications || ['Оригинальная продукция', 'Сертификат соответствия'],
      };

      const pngBuffers = await generateCarousel(
        carouselData,
        config.style,
        config.platform,
        config.productImageBase64,
        config.customColors as Record<string, string> | undefined,
      );

      if (config.outputFormat === 'pdf') {
        const pdfBuffer = await generateCarouselPdf(pngBuffers);
        return new NextResponse(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="carousel-${Date.now()}.pdf"`,
          },
        });
      }

      const images = pngBuffers.map((buf, i) => ({
        slideNumber: i + 1,
        dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
      }));

      return NextResponse.json({ images });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('[CARD-GEN] Generation error:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации. Попробуйте снова.' },
      { status: 500 },
    );
  }
}
