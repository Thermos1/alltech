import type { CardStyleDefinition } from './types';

export const premiumDarkStyle: CardStyleDefinition = {
  id: 'premium-dark',
  nameRu: 'Премиум тёмный',
  description: 'Тёмный фон, золотые акценты — для премиальных масел',
  colors: {
    background: '#0F0F1A',
    text: '#F0F0F5',
    textSecondary: '#A0A0BE',
    accent: '#D4AF37',
    accentSecondary: '#F5E6A3',
    badgeBg: '#D4AF37',
    badgeText: '#0F0F1A',
    specBg: 'rgba(212,175,55,0.1)',
    specText: '#F5E6A3',
    watermarkColor: 'rgba(212,175,55,0.06)',
  },
  fonts: {
    heading: 'Dela Gothic One',
    body: 'Golos Text',
  },
};
