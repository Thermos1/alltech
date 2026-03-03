import type { CardStyleDefinition } from './types';

export const gradientStyle: CardStyleDefinition = {
  id: 'gradient',
  nameRu: 'Градиент',
  description: 'Мягкий градиент — современный стиль',
  colors: {
    background: '#667EEA',
    backgroundEnd: '#764BA2',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.8)',
    accent: '#FFD600',
    badgeBg: '#FF6B6B',
    badgeText: '#FFFFFF',
    specBg: 'rgba(255,255,255,0.15)',
    specText: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.06)',
  },
  fonts: {
    heading: 'Dela Gothic One',
    body: 'Golos Text',
  },
};
