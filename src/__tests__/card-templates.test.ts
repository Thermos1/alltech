import { describe, it, expect } from 'vitest';
import { ALL_STYLES, PLATFORM_PRESETS } from '@/lib/card-templates';
import { CAROUSEL_SLIDES } from '@/lib/card-templates/carousel';

describe('Card templates', () => {
  it('defines all 4 styles', () => {
    expect(Object.keys(ALL_STYLES)).toHaveLength(4);
    expect(ALL_STYLES).toHaveProperty('minimalist');
    expect(ALL_STYLES).toHaveProperty('premium-dark');
    expect(ALL_STYLES).toHaveProperty('gradient');
    expect(ALL_STYLES).toHaveProperty('retro');
  });

  it('each style has required color properties', () => {
    for (const style of Object.values(ALL_STYLES)) {
      expect(style.colors.background).toBeTruthy();
      expect(style.colors.text).toBeTruthy();
      expect(style.colors.accent).toBeTruthy();
      expect(style.colors.textSecondary).toBeTruthy();
      expect(style.colors.badgeBg).toBeTruthy();
      expect(style.colors.badgeText).toBeTruthy();
      expect(style.colors.specBg).toBeTruthy();
      expect(style.colors.specText).toBeTruthy();
      expect(style.colors.watermarkColor).toBeTruthy();
    }
  });

  it('each style has font definitions', () => {
    for (const style of Object.values(ALL_STYLES)) {
      expect(style.fonts.heading).toBe('Dela Gothic One');
      expect(style.fonts.body).toBe('Golos Text');
    }
  });

  it('each style has Russian name and description', () => {
    for (const style of Object.values(ALL_STYLES)) {
      expect(style.nameRu.length).toBeGreaterThan(0);
      expect(style.description.length).toBeGreaterThan(0);
    }
  });

  it('gradient style has backgroundEnd defined', () => {
    expect(ALL_STYLES['gradient'].colors.backgroundEnd).toBeTruthy();
  });

  it('retro style uses dark neon colors', () => {
    expect(ALL_STYLES['retro'].colors.background).toBe('#0A0A0F');
    expect(ALL_STYLES['retro'].colors.accent).toBe('#FFD600');
  });

  it('defines 7 platform presets', () => {
    expect(Object.keys(PLATFORM_PRESETS)).toHaveLength(7);
  });

  it('Shopify uses 2048x2048 PNG', () => {
    expect(PLATFORM_PRESETS['shopify'].width).toBe(2048);
    expect(PLATFORM_PRESETS['shopify'].height).toBe(2048);
    expect(PLATFORM_PRESETS['shopify'].format).toBe('png');
  });

  it('WB/Ozon uses 900x1200 JPG', () => {
    expect(PLATFORM_PRESETS['wb-ozon'].width).toBe(900);
    expect(PLATFORM_PRESETS['wb-ozon'].height).toBe(1200);
    expect(PLATFORM_PRESETS['wb-ozon'].format).toBe('jpg');
  });

  it('Instagram uses 1080x1350 PNG', () => {
    expect(PLATFORM_PRESETS['instagram'].width).toBe(1080);
    expect(PLATFORM_PRESETS['instagram'].height).toBe(1350);
    expect(PLATFORM_PRESETS['instagram'].format).toBe('png');
  });

  it('TikTok uses 1080x1920 PNG', () => {
    expect(PLATFORM_PRESETS['tiktok'].width).toBe(1080);
    expect(PLATFORM_PRESETS['tiktok'].height).toBe(1920);
  });

  it('each platform has a Russian label', () => {
    for (const preset of Object.values(PLATFORM_PRESETS)) {
      expect(preset.label.length).toBeGreaterThan(0);
    }
  });

  it('carousel has 7 slides', () => {
    expect(CAROUSEL_SLIDES).toHaveLength(7);
  });

  it('carousel starts with cover slide', () => {
    expect(CAROUSEL_SLIDES[0].type).toBe('cover');
    expect(CAROUSEL_SLIDES[0].slideNumber).toBe(1);
  });

  it('carousel ends with trust slide', () => {
    expect(CAROUSEL_SLIDES[6].type).toBe('trust');
    expect(CAROUSEL_SLIDES[6].slideNumber).toBe(7);
  });

  it('carousel slides have sequential numbering', () => {
    CAROUSEL_SLIDES.forEach((slide, i) => {
      expect(slide.slideNumber).toBe(i + 1);
    });
  });

  it('carousel slide types are unique', () => {
    const types = CAROUSEL_SLIDES.map((s) => s.type);
    expect(new Set(types).size).toBe(types.length);
  });
});
