import satori from 'satori';
import sharp from 'sharp';
import { loadFonts } from './fonts';
import {
  ALL_STYLES,
  PLATFORM_PRESETS,
  CAROUSEL_SLIDES,
  type CardConfig,
  type CardStyleDefinition,
  type ExportDimensions,
  type CardElement,
  type ProductCardData,
  type ProductSpec,
} from './card-templates';
import type { CarouselData, CarouselSlideConfig, AiSlide } from './card-templates/carousel';
import { backgroundStyle, fontSize, scaleFactor, formatPrice, badgeColors } from './card-templates/shared';

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

// --- Resolve style with custom color overrides ---
function resolveStyle(config: { style: string; customColors?: Partial<CardStyleDefinition['colors']> }): CardStyleDefinition {
  const base = ALL_STYLES[config.style as keyof typeof ALL_STYLES] || ALL_STYLES['minimalist'];
  if (!config.customColors) return base;
  return {
    ...base,
    colors: { ...base.colors, ...config.customColors },
  };
}

// --- Single Card Generation ---
export async function generateCard(config: CardConfig): Promise<Buffer> {
  const fonts = await loadFonts();
  const dimensions = resolveDimensions(config);
  const style = resolveStyle(config);

  const jsx = renderCardJsx(config, style, dimensions);

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
  customColors?: Partial<CardStyleDefinition['colors']>,
): Promise<Buffer[]> {
  const fonts = await loadFonts();
  const dimensions = resolveDimensions({ platform });
  const style = resolveStyle({ style: styleId, customColors });

  const buffers: Buffer[] = [];

  // SEQUENTIAL processing to limit memory (~70MB peak for 7 slides)
  for (const slide of CAROUSEL_SLIDES) {
    const jsx = renderCarouselSlideJsx(slide, carouselData, style, dimensions, productImageBase64);

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

// --- AI Slide Sequence Generation ---
export async function generateSlideSequence(
  slides: AiSlide[],
  images: string[],
  styleId: string,
  platform: string,
  customColors?: Partial<CardStyleDefinition['colors']>,
): Promise<Buffer[]> {
  const fonts = await loadFonts();
  const dimensions = resolveDimensions({ platform });
  const style = resolveStyle({ style: styleId, customColors });

  const buffers: Buffer[] = [];
  const totalSlides = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideImage = slide.imageIndex != null && images[slide.imageIndex] ? images[slide.imageIndex] : null;
    const jsx = renderAiSlideJsx(slide, slideImage, style, dimensions, i + 1, totalSlides);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = await satori(jsx as any, {
      width: dimensions.width,
      height: dimensions.height,
      fonts,
    });

    const buffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
    buffers.push(buffer);
  }

  return buffers;
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
) {
  const { productData, enabledElements, badges, productImageBase64 } = config;
  const pad = Math.round(40 * scaleFactor(dim));
  const bg = backgroundStyle(style);
  const imageScale = config.imageScale || 0.5;

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
        // Watermark (user-uploaded logo or none)
        has(enabledElements, 'watermark') && config.watermarkImageBase64
          ? {
              type: 'img',
              props: {
                src: config.watermarkImageBase64,
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
                      maxWidth: imageScale > 0.8 ? `${Math.round(imageScale * 100)}%` : '80%',
                      maxHeight: Math.round(dim.height * imageScale),
                      objectFit: 'contain' as const,
                      ...((config.imageOffsetX || config.imageOffsetY)
                        ? { transform: `translate(${Math.round(dim.width * (config.imageOffsetX || 0) / 100)}px, ${Math.round(dim.height * (config.imageOffsetY || 0) / 100)}px)` }
                        : {}),
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

        // Specs row (universal)
        has(enabledElements, 'specs') ? renderSpecsRow(productData.specs, style, dim) : null,

        // Price + subtitle
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
                      children: `${formatPrice(productData.price)} ${productData.priceUnit || '₽'}`,
                    },
                  },
                  has(enabledElements, 'subtitle') && productData.subtitle
                    ? {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: style.fonts.body,
                            fontSize: fontSize(20, dim),
                            color: style.colors.textSecondary,
                          },
                          children: `/ ${productData.subtitle}`,
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
  specs: ProductSpec[],
  style: CardStyleDefinition,
  dim: ExportDimensions,
) {
  const visibleSpecs = specs.filter(s => s.value);
  if (visibleSpecs.length === 0) return null;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: fontSize(8, dim),
        marginTop: fontSize(10, dim),
      },
      children: visibleSpecs.map((spec, i) => ({
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
          children: `${spec.label} ${spec.value}`,
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
        return renderTrustSlide(data, style, dim);
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
  const highlightSpec = data.product.specs.find(s => s.value);

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
        highlightSpec
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
                children: `${highlightSpec.label}: ${highlightSpec.value}`,
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
  const specs = data.product.specs.filter(s => s.value);
  return renderGrid(specs.map(s => ({ title: s.label, text: s.value })), style, dim);
}

// --- Slide 3: Benefits ---
function renderBenefitsSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  return renderList(data.benefits, style, dim, '✓');
}

// --- Slide 4: Compatibility ---
function renderCompatibilitySlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  return renderGrid(data.compatibility.map(c => ({ title: c, text: '' })), style, dim);
}

// --- Slide 5: Volumes ---
function renderVolumesSlide(data: CarouselData, style: CardStyleDefinition, dim: ExportDimensions) {
  const priceUnit = data.product.priceUnit || '₽';

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
                children: `${formatPrice(v.price)} ${priceUnit}`,
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
  const items = data.usageTips.filter(t => t);
  return renderList(items, style, dim, '•');
}

// --- Slide 7: Trust ---
function renderTrustSlide(
  data: CarouselData,
  style: CardStyleDefinition,
  dim: ExportDimensions,
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
        data.product.brand
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(36, dim),
                  color: style.colors.accent,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                },
                children: data.product.brand,
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

// ============================================================
// AI SLIDE RENDERERS (for generateSlideSequence)
// ============================================================

function renderAiSlideJsx(
  slide: AiSlide,
  image: string | null,
  style: CardStyleDefinition,
  dim: ExportDimensions,
  slideNumber: number,
  totalSlides: number,
) {
  const bg = backgroundStyle(style);
  const pad = Math.round(40 * scaleFactor(dim));

  const content = (() => {
    switch (slide.type) {
      case 'photo-only':
        return renderPhotoOnlySlide(image, dim);
      case 'photo-text':
        return renderPhotoTextSlide(image, slide, style, dim);
      case 'text-only':
        return renderTextOnlySlide(slide, style, dim);
      case 'title':
        return renderTitleSlide(slide, style, dim);
      case 'list':
        return renderListSlide(slide, style, dim);
      default:
        // For existing types (cover, benefits, etc.) render as list with items
        if (slide.items && slide.items.length > 0) {
          return renderList(slide.items, style, dim, '✓');
        }
        // Fallback: render heading + body as text
        return renderTextOnlySlide(slide, style, dim);
    }
  })();

  // photo-only is full-bleed, no wrapper padding
  if (slide.type === 'photo-only') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: dim.width,
          height: dim.height,
          overflow: 'hidden',
          position: 'relative',
        },
        children: [content],
      },
    };
  }

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
        // Slide counter
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
            children: `${slideNumber} / ${totalSlides}`,
          },
        },
        // Heading (if present and not title/text-only which handle it internally)
        slide.heading && !['title', 'text-only', 'photo-text'].includes(slide.type)
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
                children: slide.heading,
              },
            }
          : null,
        content,
      ].filter(Boolean),
    },
  };
}

function renderPhotoOnlySlide(image: string | null, dim: ExportDimensions) {
  if (!image) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: dim.width,
          height: dim.height,
          backgroundColor: '#1a1a2e',
          alignItems: 'center',
          justifyContent: 'center',
        },
        children: '',
      },
    };
  }
  return {
    type: 'img',
    props: {
      src: image,
      style: {
        width: dim.width,
        height: dim.height,
        objectFit: 'cover' as const,
      },
    },
  };
}

function renderPhotoTextSlide(
  image: string | null,
  slide: AiSlide,
  style: CardStyleDefinition,
  dim: ExportDimensions,
) {
  const pad = Math.round(40 * scaleFactor(dim));

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
      },
      children: [
        // Background image
        image
          ? {
              type: 'img',
              props: {
                src: image,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover' as const,
                },
              },
            }
          : null,
        // Dark overlay
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
            },
            children: '',
          },
        },
        // Text overlay at bottom
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: pad,
              gap: fontSize(12, dim),
            },
            children: [
              slide.heading
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontFamily: style.fonts.heading,
                        fontSize: fontSize(36, dim),
                        color: '#ffffff',
                        lineHeight: 1.2,
                      },
                      children: slide.heading,
                    },
                  }
                : null,
              slide.body
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontFamily: style.fonts.body,
                        fontSize: fontSize(22, dim),
                        color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.5,
                      },
                      children: slide.body,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      ].filter(Boolean),
    },
  };
}

function renderTextOnlySlide(
  slide: AiSlide,
  style: CardStyleDefinition,
  dim: ExportDimensions,
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
        textAlign: 'center' as const,
      },
      children: [
        slide.heading
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(42, dim),
                  color: style.colors.text,
                  lineHeight: 1.3,
                  maxWidth: '90%',
                },
                children: slide.heading,
              },
            }
          : null,
        slide.body
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontSize: fontSize(24, dim),
                  color: style.colors.textSecondary,
                  lineHeight: 1.6,
                  maxWidth: '85%',
                },
                children: slide.body,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

function renderTitleSlide(
  slide: AiSlide,
  style: CardStyleDefinition,
  dim: ExportDimensions,
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
        gap: fontSize(20, dim),
        textAlign: 'center' as const,
      },
      children: [
        slide.heading
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.heading,
                  fontSize: fontSize(52, dim),
                  color: style.colors.accent,
                  lineHeight: 1.2,
                  maxWidth: '90%',
                },
                children: slide.heading,
              },
            }
          : null,
        slide.body
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: style.fonts.body,
                  fontSize: fontSize(26, dim),
                  color: style.colors.textSecondary,
                  lineHeight: 1.5,
                  maxWidth: '80%',
                },
                children: slide.body,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

function renderListSlide(
  slide: AiSlide,
  style: CardStyleDefinition,
  dim: ExportDimensions,
) {
  return renderList(slide.items || [], style, dim, '•');
}
