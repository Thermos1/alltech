import type { CardStyleDefinition } from './types';

export const minimalistStyle: CardStyleDefinition = {
  id: 'minimalist',
  nameRu: 'Минимализм',
  description: 'Светлый фон, чистый стиль — для WB/Ozon',
  colors: {
    background: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    accent: '#2563EB',
    badgeBg: '#EF4444',
    badgeText: '#FFFFFF',
    specBg: '#F3F4F6',
    specText: '#374151',
    watermarkColor: 'rgba(0,0,0,0.05)',
  },
  fonts: {
    heading: 'Dela Gothic One',
    body: 'Golos Text',
  },
};
