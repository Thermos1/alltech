import type { ProductCardData } from './types';

export type CarouselSlideType =
  | 'cover'
  | 'specs'
  | 'benefits'
  | 'compatibility'
  | 'volumes'
  | 'usage'
  | 'trust'
  | 'photo-only'
  | 'photo-text'
  | 'text-only'
  | 'title'
  | 'list';

export type AiSlide = {
  type: CarouselSlideType;
  imageIndex?: number;
  heading?: string;
  body?: string;
  items?: string[];
};

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
  { type: 'volumes', title: 'Варианты и цены', slideNumber: 5 },
  { type: 'usage', title: 'Применение', slideNumber: 6 },
  { type: 'trust', title: 'Гарантия качества', slideNumber: 7 },
];

export type CarouselData = {
  product: ProductCardData;
  benefits: string[];
  compatibility: string[];
  volumes: { volume: string; price: number }[];
  usageTips: string[];
  certifications: string[];
};

export const DEFAULT_BENEFITS = [
  'Высокое качество продукции',
  'Выгодные условия покупки',
  'Быстрая доставка',
  'Гарантия от производителя',
];

export const DEFAULT_COMPATIBILITY = [
  'Вариант 1',
  'Вариант 2',
  'Вариант 3',
];

export const DEFAULT_CERTIFICATIONS = [
  'Оригинальная продукция',
  'Сертификат соответствия',
  'Гарантия качества',
];

export const DEFAULT_USAGE_TIPS = [
  'Ознакомьтесь с инструкцией перед использованием',
  'Храните в сухом месте при комнатной температуре',
];
