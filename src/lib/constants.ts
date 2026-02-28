export const COMPANY = {
  name: "АЛТЕХ",
  tagline: "Родом из Якутии",
  description:
    "Официальный дистрибьютор смазочных материалов ROLF, SINTEC, TAKAYAMA, KIXX, RHINOIL, ХИМАВТО",
  phones: ["+7 (924) 171-61-22", "+7 (914) 274-44-20"],
  email: "Alltech.dv@gmail.com",
  telegram: "alltech14_ykt",
  instagram: "alltech.14",
  website: "altehspec.ru",
  city: "Якутск",
} as const;

export const SECTIONS = {
  lubricants: {
    slug: "lubricants",
    name: "Смазочные материалы",
    description: "Моторные, трансмиссионные, гидравлические масла и технические жидкости",
  },
  filters: {
    slug: "filters",
    name: "Фильтрующие элементы",
    description: "Масляные, воздушные, топливные фильтры на все виды техники",
  },
} as const;

export const BRANDS = [
  { slug: "rolf", name: "ROLF" },
  { slug: "sintec", name: "SINTEC" },
  { slug: "takayama", name: "TAKAYAMA" },
  { slug: "kixx", name: "KIXX" },
  { slug: "rhinoil", name: "RhinOIL" },
  { slug: "himavto", name: "ХИМАВТО" },
  { slug: "volga", name: "Volga Oil" },
] as const;

export const VEHICLE_BRANDS = [
  { slug: "shacman", name: "SHACMAN" },
  { slug: "howo", name: "HOWO" },
  { slug: "faw", name: "FAW" },
  { slug: "sitrak", name: "SITRAK" },
  { slug: "hino", name: "HINO" },
  { slug: "shanbo", name: "SHANBO" },
] as const;

export const OIL_BASE_TYPES = {
  synthetic: "Синтетика",
  semi_synthetic: "Полусинтетика",
  mineral: "Минеральное",
} as const;

export const BONUS_TIERS = [
  { name: "Старт", min: 0, max: 99_999, percent: 3, color: "text-text-secondary" },
  { name: "Бронза", min: 100_000, max: 299_999, percent: 5, color: "text-amber-500" },
  { name: "Серебро", min: 300_000, max: 499_999, percent: 7, color: "text-gray-300" },
  { name: "Золото", min: 500_000, max: 999_999, percent: 10, color: "text-accent-yellow" },
  { name: "Платина", min: 1_000_000, max: Infinity, percent: 15, color: "text-accent-cyan" },
] as const;

export function getBonusTier(totalSpent: number) {
  return BONUS_TIERS.find((t) => totalSpent >= t.min && totalSpent <= t.max) ?? BONUS_TIERS[0];
}

export function getNextTier(totalSpent: number) {
  const currentIndex = BONUS_TIERS.findIndex((t) => totalSpent >= t.min && totalSpent <= t.max);
  if (currentIndex < BONUS_TIERS.length - 1) return BONUS_TIERS[currentIndex + 1];
  return null;
}
