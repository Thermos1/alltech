export type CardStyleId = 'minimalist' | 'premium-dark' | 'gradient' | 'retro';

export type ProductSpec = {
  label: string;
  value: string;
};

export type CardElement =
  | 'productName'
  | 'price'
  | 'brandName'
  | 'subtitle'
  | 'specs'
  | 'badges'
  | 'watermark'
  | 'slideNumber';

export type BadgeConfig = {
  text: string;
  type: 'hit' | 'new' | 'sale' | 'custom';
};

export type ExportPlatform = 'wb-ozon' | 'shopify' | 'instagram' | 'telegram-vk' | 'tiktok' | 'pinterest' | 'custom';

export type ExportDimensions = {
  width: number;
  height: number;
  format: 'png' | 'jpg';
  label: string;
};

export const PLATFORM_PRESETS: Record<ExportPlatform, ExportDimensions> = {
  'wb-ozon': { width: 900, height: 1200, format: 'jpg', label: 'WB / Ozon (900×1200)' },
  'shopify': { width: 2048, height: 2048, format: 'png', label: 'Shopify (2048×2048)' },
  'instagram': { width: 1080, height: 1350, format: 'png', label: 'Instagram / LinkedIn (1080×1350)' },
  'telegram-vk': { width: 1080, height: 1080, format: 'png', label: 'Telegram / VK (1080×1080)' },
  'tiktok': { width: 1080, height: 1920, format: 'png', label: 'TikTok (1080×1920)' },
  'pinterest': { width: 1000, height: 1500, format: 'png', label: 'Pinterest (1000×1500)' },
  'custom': { width: 1080, height: 1080, format: 'png', label: 'Свой размер' },
};

export type ProductCardData = {
  name: string;
  brand?: string;
  price?: number;
  priceUnit?: string;
  subtitle?: string;
  specs: ProductSpec[];
  description?: string;
};

export type CardConfig = {
  mode: 'card';
  style: CardStyleId;
  platform: ExportPlatform;
  customWidth?: number;
  customHeight?: number;
  enabledElements: CardElement[];
  badges: BadgeConfig[];
  productData: ProductCardData;
  productImageBase64: string;
  outputFormat: 'png' | 'jpg';
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  customColors?: Partial<CardStyleColors>;
  watermarkImageBase64?: string;
};

export type CardStyleColors = {
  background: string;
  backgroundEnd?: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSecondary?: string;
  badgeBg: string;
  badgeText: string;
  specBg: string;
  specText: string;
  watermarkColor: string;
};

export type CardStyleDefinition = {
  id: CardStyleId;
  nameRu: string;
  description: string;
  colors: CardStyleColors;
  fonts: {
    heading: string;
    body: string;
  };
};

export const DEFAULT_ELEMENTS: CardElement[] = [
  'productName',
  'price',
  'brandName',
  'subtitle',
  'specs',
];

export const SPEC_PRESETS: Record<string, { label: string; specs: ProductSpec[] }> = {
  oils: {
    label: 'Масла',
    specs: [
      { label: 'Вязкость', value: '' },
      { label: 'API', value: '' },
      { label: 'ACEA', value: '' },
      { label: 'Тип базы', value: '' },
    ],
  },
  electronics: {
    label: 'Электроника',
    specs: [
      { label: 'Мощность', value: '' },
      { label: 'Напряжение', value: '' },
      { label: 'Вес', value: '' },
    ],
  },
  clothing: {
    label: 'Одежда',
    specs: [
      { label: 'Размер', value: '' },
      { label: 'Материал', value: '' },
      { label: 'Состав', value: '' },
    ],
  },
  cosmetics: {
    label: 'Косметика',
    specs: [
      { label: 'Объём', value: '' },
      { label: 'Тип кожи', value: '' },
      { label: 'Состав', value: '' },
    ],
  },
};
