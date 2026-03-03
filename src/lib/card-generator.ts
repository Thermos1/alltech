import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadFonts } from './fonts';
import {
  ALL_STYLES,
  PLATFORM_PRESETS,
  CAROUSEL_SLIDES,
  type CardConfig,
  type CardStyleDefinition,
  type ExportDimensions,
  type CardElement,
  type BadgeConfig,
  type ProductCardData,
} from './card-templates';
import type { CarouselData, CarouselSlideConfig } from './card-templates/carousel';
import { backgroundStyle, fontSize, padding, formatPrice, badgeColors, baseTypeLabel, scaleFactor } from './card-templates/shared';

// --- Watermark logo cache ---
let cachedLogoBase64: string | null = null;

async function getLogoBase64(): Promise<string> {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const logoPath = join(process.cwd(), 'public', 'images', 'logo-white.png');
    const buffer = await readFile(logoPath);
    cachedLogoBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    return cachedLogoBase64;
  } catch {
    return '';
  }
}

// --- Resolve dimensions ---
function resolveDimensions(config: { platform: string; customWidth?: number; customHeight?: number }): ExportDimensions {
  if (config.platform === 'custom') {
    return {
      width: config.customWidth || 1080,
      height: config.customHeight || 1080,
      format: 'png',
      label: 'Custom',
    };
  }
  return PLATFORM_PRESETS[config.platform as keyof typeof PLATFORM_PRESETS] || PLATFORM_PRESETS['instagram'];
}

// --- Single Card Generation ---
export async function generateCard(config: CardConfig): Promise<Buffer> {
  const fonts = await loadFonts();
  const dimensions = resolveDimensions(config);
  const style = ALL_STYLES[config.style];
  const logoBase64 = await getLogoBase64();

  const jsx = renderCardJsx(config, style, dimensions, logoBase64);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Satori accepts object JSX at runtime
  const svg = await satori(jsx as any, {
    width: dimensions.width,
    height: dimensions.height,
    fonts,
  });

  const format = config.outputFormat || dimensions.format;
  const sharpInstance = sharp(Buffer.from(svg));

  if (format === 'jpg') {
    return sharpInstance.jpeg({ quality: 92 }).toBuffer();
  }
  return sharpInstance.png({ quality: 90, compressionLevel: 6 }).toBuffer();
}

// --- Carousel Generation ---
export async function generateCarousel(
  carouselData: CarouselData,
  styleId: string,
  platform: string,
  productImageBase64: string,
): Promise<Buffer[]> {
  const fonts = await loadFonts();
  const dimensions = resolveDimensions({ platform });
  const style = ALL_STYLES[styleId as keyof typeof ALL_STYLES];
  const logoBase64 = await getLogoBase64();

  const buffers: Buffer[] = [];

  // SEQUENTIAL processing to limit memory (~70MB peak for 7 slides)
  for (const slide of CAROUSEL_SLIDES) {
    const jsx = renderCarouselSlideJsx(slide, carouselData, style, dimensions, productImageBase64, logoBase64);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Satori accepts object JSX at runtime
    const svg = await satori(jsx as any, {
      width: dimensions.width,
      height: dimensions.height,
      fonts,
    });

    const buffer = await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toBuffer();

    buffers.push(buffer);
  }

  return buffers;
}

// --- PDF Carousel (for LinkedIn) ---
export async function generateCarouselPdf(pngBuffers: Buffer[]): Promise<Buffer> {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();

  for (const pngBuffer of pngBuffers) {
    const pngImage = await pdf.embedPng(pngBuffer);
    const page = pdf.addPage([pngImage.width, pngImage.height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height,
    });
  }

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}

// ============================================================
// JSX RENDERING FUNCTIONS (Satori-compatible)
// ============================================================

function has(elements: CardElement[], el: CardElement): boolean {
  return elements.includes(el);
}

function renderCardJsx(
  config: CardConfig,
  style: CardStyleDefinition,
  dim: ExportDimensions,
  logoBase64: string,
) {
  const { productData, enabledElements, badges, productImageBase64 } = config;
  const s = scaleFactor(dim);
  const pad = Math.round(40 * s);
  const bg = backgroundStyle(style);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: dim.width,
        height: dim.height,
        ...bg,
        padding: pad,
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Watermark
        has(enabledElements, 'watermark') && logoBase64
          ? {
              type: 'img',
              props: {
                src: logoBase64,
                width: Math.round(dim.width * 0.5),
                height: Math.round(dim.width * 0.5),
                style: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.04,
                },
              },
            }
          : null,

        // Badges
        has(enabledElements, 'badges') && badges.length > 0
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  position: 'absolute',
                  top: pad,
                  right: pad,
                  gap: 8,
                },
                children: badges.map((badge, i) => {
                  const bc = badgeColors(badge, style);
                  return {
                    type: 'div',
                    key: String(i),
                    props: {
                      style: {
                        display: 'flex',
                        backgroundColor: bc.bg,
                        color: bc.text,
                        fontFamily: style.fonts.body,
                        fontWeight: 700,
                        fontSize: fontSize(18, dim),
                        padding: `${fontSize(8, dim)}px ${fontSize(16, dim)}px`,
                        borderRadius: fontSize(8, dim),
                      },
                      children: badge.text,
                    },
                  };
                }),
              },
            }
          : null,

        // Brand name (top)
        has(enabledElements, 'brandName') && productData.brand
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontWeight: 700,
                  fontSize: fontSize(22, dim),
                  color: style.colors.textSecondary,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  marginBottom: fontSize(8, dim),
                },
                children: productData.brand,
              },
            }
          : null,

        // Product image
        productImageBase64
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  minHeight: 0,
                },
                children: {
                  type: 'img',
                  props: {
                    src: productImageBase64,
                    style: {
                      maxWidth: '80%',
                      maxHeight: Math.round(dim.height * 0.5),
                      objectFit: 'contain' as const,
                    },
                  },
                },
              },
            }
          : null,

        // Product name
        has(enabledElements, 'productName')
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(36, dim),
                  color: style.colors.text,
                  marginTop: fontSize(16, dim),
                  lineHeight: 1.2,
                },
                children: productData.name,
              },
            }
          : null,

        // Specs row
        renderSpecsRow(productData, enabledElements, style, dim),

        // Price
        has(enabledElements, 'price') && productData.price
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: fontSize(8, dim),
                  marginTop: fontSize(12, dim),
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontFamily: style.fonts.heading,
                        fontSize: fontSize(40, dim),
                        color: style.colors.accent,
                      },
                      children: `${formatPrice(productData.price)} ₽`,
                    },
                  },
                  productData.volume
                    ? {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: style.fonts.body,
                            fontSize: fontSize(20, dim),
                            color: style.colors.textSecondary,
                          },
                          children: `/ ${productData.volume}`,
                        },
                      }
                    : null,
                ],
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

function renderSpecsRow(
  data: ProductCardData,
  elements: CardElement[],
  style: CardStyleDefinition,
  dim: ExportDimensions,
) {
  const specs: string[] = [];

  if (has(elements, 'viscosity') && data.viscosity) specs.push(data.viscosity);
  if (has(elements, 'baseType') && data.baseType) specs.push(baseTypeLabel(data.baseType));
  if (has(elements, 'apiSpec') && data.apiSpec) specs.push(`API ${data.apiSpec}`);
  if (has(elements, 'aceaSpec') && data.aceaSpec) specs.push(`ACEA ${data.aceaSpec}`);

  if (specs.length === 0) return null;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: fontSize(8, dim),
        marginTop: fontSize(10, dim),
      },
      children: specs.map((spec, i) => ({
        type: 'div',
        key: String(i),
        props: {
          style: {
            display: 'flex',
            backgroundColor: style.colors.specBg,
            color: style.colors.specText,
            fontFamily: style.fonts.body,
            fontSize: fontSize(16, dim),
            padding: `${fontSize(6, dim)}px ${fontSize(12, dim)}px`,
            borderRadius: fontSize(6, dim),
          },
          children: spec,
        },
      })),
    },
  };
}

// ============================================================
// CAROUSEL SLIDE RENDERING
// ============================================================

function renderCarouselSlideJsx(
  slide: CarouselSlideConfig,
  data: CarouselData,
  style: CardStyleDefinition,
  dim: ExportDimensions,
  productImageBase64: string,
  logoBase64: string,
) {
  const bg = backgroundStyle(style);
  const pad = Math.round(40 * scaleFactor(dim));

  const content = (() => {
    switch (slide.type) {
      case 'cover':
        return renderCoverSlide(data, style, dim, productImageBase64);
      case 'specs':
        return renderSpecsSlide(data, style, dim);
      case 'benefits':
        return renderBenefitsSlide(data, style, dim);
      case 'compatibility':
        return renderCompatibilitySlide(data, style, dim);
      case 'volumes':
        return renderVolumesSlide(data, style, dim);
      case 'usage':
        return renderUsageSlide(data, style, dim);
      case 'trust':
        return renderTrustSlide(data, style, dim, logoBase64);
    }
  })();

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: dim.width,
        height: dim.height,
        ...bg,
        padding: pad,
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Watermark
        logoBase64
          ? {
              type: 'img',
              props: {
                src: logoBase64,
                width: Math.round(dim.width * 0.4),
                height: Math.round(dim.width * 0.4),
                style: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.03,
                },
              },
            }
          : null,
        // Slide number
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              bottom: pad,
              right: pad,
              fontFamily: style.fonts.body,
              fontSize: fontSize(16, dim),
              color: style.colors.textSecondary,
              opacity: 0.5,
            },
            children: `${slide.slideNumber} / 7`,
          },
        },
        // Slide title
        slide.title
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(32, dim),
                  color: style.colors.accent,
                  marginBottom: fontSize(24, dim),
                },
                children: slide.title,
              },
            }
          : null,
        // Slide content
        content,
      ].filter(Boolean),
    },
  };
}

// --- Slide 1: Cover ---
function renderCoverSlide(
  data: CarouselData,
  style: CardStyleDefinition,
  dim: ExportDimensions,
  productImageBase64: string,
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        gap: fontSize(16, dim),
      },
      children: [
        productImageBase64
          ? {
              type: 'img',
              props: {
                src: productImageBase64,
                style: {
                  maxWidth: '70%',
                  maxHeight: Math.round(dim.height * 0.5),
                  objectFit: 'contain' as const,
                },
              },
            }
          : null,
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: style.fonts.heading,
              fontSize: fontSize(40, dim),
              color: style.colors.text,
              textAlign: 'center' as const,
            },
            children: data.product.name,
          },
        },
        data.product.viscosity
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontWeight: 700,
                  fontSize: fontSize(28, dim),
                  color: style.colors.accent,
                },
                children: data.product.viscosity,
              },
            }
          : null,
        data.product.brand
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontSize: fontSize(20, dim),
                  color: style.colors.textSecondary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.15em',
                },
                children: data.product.brand,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

// --- Slide 2: Specs ---
function renderSpecsSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  const specs: { label: string; value: string }[] = [];
  if (data.product.viscosity) specs.push({ label: 'Вязкость', value: data.product.viscosity });
  if (data.product.baseType) specs.push({ label: 'Тип базы', value: baseTypeLabel(data.product.baseType) });
  if (data.product.apiSpec) specs.push({ label: 'API', value: data.product.apiSpec });
  if (data.product.aceaSpec) specs.push({ label: 'ACEA', value: data.product.aceaSpec });
  if (data.product.approvals) specs.push({ label: 'Допуски', value: data.product.approvals });

  return renderGrid(specs.map(s => ({
    title: s.label,
    text: s.value,
  })), style, dim);
}

// --- Slide 3: Benefits ---
function renderBenefitsSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  return renderList(data.benefits, style, dim, '✓');
}

// --- Slide 4: Compatibility ---
function renderCompatibilitySlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  return renderGrid(data.compatibility.map(c => ({
    title: c,
    text: '',
  })), style, dim);
}

// --- Slide 5: Volumes ---
function renderVolumesSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: fontSize(12, dim),
        flexGrow: 1,
      },
      children: data.volumes.map((v, i) => ({
        type: 'div',
        key: String(i),
        props: {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: style.colors.specBg,
            borderRadius: fontSize(12, dim),
            padding: `${fontSize(16, dim)}px ${fontSize(24, dim)}px`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontWeight: 700,
                  fontSize: fontSize(24, dim),
                  color: style.colors.text,
                },
                children: v.volume,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(28, dim),
                  color: style.colors.accent,
                },
                children: `${formatPrice(v.price)} ₽`,
              },
            },
          ],
        },
      })),
    },
  };
}

// --- Slide 6: Usage ---
function renderUsageSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  const items: string[] = [];
  if (data.changeInterval) items.push(`Интервал замены: ${data.changeInterval}`);
  if (data.storageConditions) items.push(`Условия хранения: ${data.storageConditions}`);
  items.push('Проверяйте уровень масла каждые 5 000 км');
  items.push('Используйте оригинальные фильтры');

  return renderList(items, style, dim, '•');
}

// --- Slide 7: Trust ---
function renderTrustSlide(
  data: CarouselData,
  style: CardStyleDefinition,
  dim: ExportDimensions,
  logoBase64: string,
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        gap: fontSize(24, dim),
      },
      children: [
        logoBase64
          ? {
              type: 'img',
              props: {
                src: logoBase64,
                width: Math.round(dim.width * 0.3),
                height: Math.round(dim.width * 0.15),
                style: { objectFit: 'contain' as const, opacity: 0.8 },
              },
            }
          : null,
        ...data.certifications.map((cert, i) => ({
          type: 'div',
          key: String(i),
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: fontSize(12, dim),
              backgroundColor: style.colors.specBg,
              borderRadius: fontSize(12, dim),
              padding: `${fontSize(14, dim)}px ${fontSize(24, dim)}px`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: style.fonts.body,
                    fontWeight: 700,
                    fontSize: fontSize(18, dim),
                    color: style.colors.accent,
                  },
                  children: '✓',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: style.fonts.body,
                    fontSize: fontSize(20, dim),
                    color: style.colors.text,
                  },
                  children: cert,
                },
              },
            ],
          },
        })),
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: style.fonts.body,
              fontSize: fontSize(16, dim),
              color: style.colors.textSecondary,
              marginTop: fontSize(16, dim),
            },
            children: 'АЛТЕХ — Родом из Якутии',
          },
        },
      ].filter(Boolean),
    },
  };
}

// ============================================================
// SHARED LAYOUT HELPERS
// ============================================================

function renderGrid(
  items: { title: string; text: string }[],
  style: CardStyleDefinition,
  dim: ExportDimensions,
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: fontSize(12, dim),
        flexGrow: 1,
      },
      children: items.map((item, i) => ({
        type: 'div',
        key: String(i),
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: style.colors.specBg,
            borderRadius: fontSize(12, dim),
            padding: `${fontSize(16, dim)}px ${fontSize(20, dim)}px`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontSize: fontSize(14, dim),
                  color: style.colors.textSecondary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: item.text ? fontSize(4, dim) : 0,
                },
                children: item.title,
              },
            },
            item.text
              ? {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontFamily: style.fonts.body,
                      fontWeight: 700,
                      fontSize: fontSize(22, dim),
                      color: style.colors.text,
                    },
                    children: item.text,
                  },
                }
              : null,
          ].filter(Boolean),
        },
      })),
    },
  };
}

function renderList(
  items: string[],
  style: CardStyleDefinition,
  dim: ExportDimensions,
  bullet: string,
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: fontSize(16, dim),
        flexGrow: 1,
      },
      children: items.map((item, i) => ({
        type: 'div',
        key: String(i),
        props: {
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: fontSize(12, dim),
            backgroundColor: style.colors.specBg,
            borderRadius: fontSize(12, dim),
            padding: `${fontSize(16, dim)}px ${fontSize(20, dim)}px`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontWeight: 700,
                  fontSize: fontSize(22, dim),
                  color: style.colors.accent,
                  flexShrink: 0,
                },
                children: bullet,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontSize: fontSize(20, dim),
                  color: style.colors.text,
                  lineHeight: 1.4,
                },
                children: item,
              },
            },
          ],
        },
      })),
    },
  };
}
