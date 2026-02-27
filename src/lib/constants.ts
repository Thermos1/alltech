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
