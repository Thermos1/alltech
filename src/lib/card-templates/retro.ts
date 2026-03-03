import type { CardStyleDefinition } from './types';

export const retroStyle: CardStyleDefinition = {
  id: 'retro',
  nameRu: 'Ретрофутуризм',
  description: 'Фирменный стиль АЛТЕХ — неон, тёмный фон',
  colors: {
    background: '#0A0A0F',
    text: '#F0F0F5',
    textSecondary: '#A0A0BE',
    accent: '#FFD600',
    accentSecondary: '#00E5FF',
    badgeBg: '#FF2D78',
    badgeText: '#FFFFFF',
    specBg: 'rgba(255,214,0,0.08)',
    specText: '#00E5FF',
    watermarkColor: 'rgba(255,214,0,0.05)',
  },
  fonts: {
    heading: 'Dela Gothic One',
    body: 'Golos Text',
  },
};
