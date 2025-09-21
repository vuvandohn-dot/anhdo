
import { BackgroundStyle, AspectRatio } from './types';

export const BACKGROUND_STYLES: { value: BackgroundStyle; label: string }[] = [
  { value: 'Studio', label: 'Studio' },
  { value: 'Ngoài trời', label: 'Ngoài trời' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Tropical', label: 'Tropical' },
  { value: 'Minimalist', label: 'Minimalist' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Vuông' },
  { value: '16:9', label: 'Ngang' },
  { value: '9:16', label: 'Dọc' },
];

export const MAX_FILE_SIZE_MB = 20;
export const MAX_PROMPT_WORDS = 100;
