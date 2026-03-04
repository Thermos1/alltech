import type { CardStyleDefinition, ExportDimensions, BadgeConfig } from './types';

// Scale factor based on dimensions (relative to 1080x1350 reference)
export function scaleFactor(dimensions: ExportDimensions): number {
  return Math.min(dimensions.width / 1080, dimensions.height / 1350);
}

// Scale font size proportionally
export function fontSize(base: number, dimensions: ExportDimensions): number {
  return Math.round(base * scaleFactor(dimensions));
}

// Scale padding proportionally
export function padding(base: number, dimensions: ExportDimensions): number {
  return Math.round(base * scaleFactor(dimensions));
}

// Format price with spaces: 1234 → "1 234"
export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}

// Background style for a card
export function backgroundStyle(style: CardStyleDefinition): Record<string, string> {
  if (style.colors.backgroundEnd) {
    return {
      backgroundImage: `linear-gradient(135deg, ${style.colors.background} 0%, ${style.colors.backgroundEnd} 100%)`,
    };
  }
  return {
    backgroundColor: style.colors.background,
  };
}

// Badge color presets
export function badgeColors(badge: BadgeConfig, style: CardStyleDefinition): { bg: string; text: string } {
  switch (badge.type) {
    case 'hit':
      return { bg: style.colors.badgeBg, text: style.colors.badgeText };
    case 'new':
      return { bg: style.colors.accent, text: style.colors.badgeText };
    case 'sale':
      return { bg: '#EF4444', text: '#FFFFFF' };
    case 'custom':
    default:
      return { bg: style.colors.badgeBg, text: style.colors.badgeText };
  }
}
