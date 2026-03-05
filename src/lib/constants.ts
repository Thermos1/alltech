export const COMPANY = {
  name: "АЛТЕХ",
  tagline: "Родом из Якутии",
  description:
    "Официальный дистрибьютор смазочных материалов ROLF, SINTEC, TAKAYAMA, KIXX, RHINOIL, ХИМАВТО",
  phones: ["+7 (996) 914-28-32"],
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
  { slug: "kixx", name: "KIXX" },
  { slug: "rhinoil", name: "RhinOIL" },
  { slug: "himavto", name: "ХИМАВТО" },
  { slug: "volga", name: "Volga Oil" },
  { slug: "akross", name: "AKross" },
  { slug: "savtok", name: "Savtok" },
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
  { name: "Старт", min: 0, max: 499_999, percent: 2, color: "text-text-secondary" },
  { name: "Серебро", min: 500_000, max: 999_999, percent: 3, color: "text-gray-300" },
  { name: "Золото", min: 1_000_000, max: Infinity, percent: 5, color: "text-accent-yellow-text" },
] as const;

export function getBonusTier(totalSpent: number) {
  return BONUS_TIERS.find((t) => totalSpent >= t.min && totalSpent <= t.max) ?? BONUS_TIERS[0];
}

export function getNextTier(totalSpent: number) {
  const currentIndex = BONUS_TIERS.findIndex((t) => totalSpent >= t.min && totalSpent <= t.max);
  if (currentIndex < BONUS_TIERS.length - 1) return BONUS_TIERS[currentIndex + 1];
  return null;
}
