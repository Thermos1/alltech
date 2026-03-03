import type { ProductCardData } from './types';

export type CarouselSlideType =
  | 'cover'
  | 'specs'
  | 'benefits'
  | 'compatibility'
  | 'volumes'
  | 'usage'
  | 'trust';

export type CarouselSlideConfig = {
  type: CarouselSlideType;
  title: string;
  slideNumber: number;
};

export const CAROUSEL_SLIDES: CarouselSlideConfig[] = [
  { type: 'cover', title: '', slideNumber: 1 },
  { type: 'specs', title: 'Характеристики', slideNumber: 2 },
  { type: 'benefits', title: 'Преимущества', slideNumber: 3 },
  { type: 'compatibility', title: 'Совместимость', slideNumber: 4 },
  { type: 'volumes', title: 'Объёмы и цены', slideNumber: 5 },
  { type: 'usage', title: 'Применение', slideNumber: 6 },
  { type: 'trust', title: 'Гарантия качества', slideNumber: 7 },
];

export type CarouselData = {
  product: ProductCardData;
  benefits: string[];
  compatibility: string[];
  volumes: { volume: string; price: number }[];
  changeInterval?: string;
  storageConditions?: string;
  certifications: string[];
};

export const DEFAULT_BENEFITS = [
  'Надёжная защита двигателя от износа',
  'Экономия топлива',
  'Стабильная работа при низких температурах',
  'Увеличенный интервал замены',
];

export const DEFAULT_COMPATIBILITY = [
  'SHACMAN',
  'HOWO',
  'FAW',
  'SITRAK',
  'HINO',
];

export const DEFAULT_CERTIFICATIONS = [
  'Оригинальная продукция',
  'Сертификат соответствия',
  'Гарантия качества',
];
