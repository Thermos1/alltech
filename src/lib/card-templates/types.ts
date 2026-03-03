export type CardStyleId = 'minimalist' | 'premium-dark' | 'gradient' | 'retro';

export type CardElement =
  | 'productName'
  | 'price'
  | 'brandName'
  | 'viscosity'
  | 'apiSpec'
  | 'aceaSpec'
  | 'baseType'
  | 'badges'
  | 'watermark'
  | 'slideNumber';

export type BadgeConfig = {
  text: string;
  type: 'hit' | 'new' | 'sale' | 'custom';
};

export type ExportPlatform = 'wb-ozon' | 'instagram' | 'telegram-vk' | 'tiktok' | 'pinterest' | 'custom';

export type ExportDimensions = {
  width: number;
  height: number;
  format: 'png' | 'jpg';
  label: string;
};

export const PLATFORM_PRESETS: Record<ExportPlatform, ExportDimensions> = {
  'wb-ozon': { width: 900, height: 1200, format: 'jpg', label: 'WB / Ozon (900×1200)' },
  'instagram': { width: 1080, height: 1350, format: 'png', label: 'Instagram / LinkedIn (1080×1350)' },
  'telegram-vk': { width: 1080, height: 1080, format: 'png', label: 'Telegram / VK (1080×1080)' },
  'tiktok': { width: 1080, height: 1920, format: 'png', label: 'TikTok (1080×1920)' },
  'pinterest': { width: 1000, height: 1500, format: 'png', label: 'Pinterest (1000×1500)' },
  'custom': { width: 1080, height: 1080, format: 'png', label: 'Свой размер' },
};

export type ProductCardData = {
  name: string;
  brand?: string;
  viscosity?: string;
  baseType?: string;
  apiSpec?: string;
  aceaSpec?: string;
  approvals?: string;
  price?: number;
  volume?: string;
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
};

export type CardStyleDefinition = {
  id: CardStyleId;
  nameRu: string;
  description: string;
  colors: {
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
  fonts: {
    heading: string;
    body: string;
  };
};

export const BASE_TYPE_LABELS: Record<string, string> = {
  synthetic: 'Синтетика',
  semi_synthetic: 'Полусинтетика',
  mineral: 'Минеральное',
};

export const DEFAULT_ELEMENTS: CardElement[] = [
  'productName',
  'price',
  'brandName',
  'viscosity',
  'baseType',
  'watermark',
];
