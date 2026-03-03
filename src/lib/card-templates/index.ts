export * from './types';
export * from './carousel';
export * from './shared';

export { minimalistStyle } from './minimalist';
export { premiumDarkStyle } from './premium-dark';
export { gradientStyle } from './gradient';
export { retroStyle } from './retro';

import { minimalistStyle } from './minimalist';
import { premiumDarkStyle } from './premium-dark';
import { gradientStyle } from './gradient';
import { retroStyle } from './retro';
import type { CardStyleDefinition, CardStyleId } from './types';

export const ALL_STYLES: Record<CardStyleId, CardStyleDefinition> = {
  'minimalist': minimalistStyle,
  'premium-dark': premiumDarkStyle,
  'gradient': gradientStyle,
  'retro': retroStyle,
};
