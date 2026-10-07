import type { SkinTone } from '@/domain/types';

export interface SkinToneOption {
  value: SkinTone;
  /** Spoken and shown as "Tom de pele <label>". */
  label: string;
  /** The tone's base skin color, as drawn by scripts/generate-svg-assets.py. */
  swatch: string;
  /** The selected check drawn on top of the swatch: needs 3:1 against it. */
  checkColor: string;
}

export const SKIN_TONES: SkinToneOption[] = [
  { value: 'light', label: 'claro', swatch: '#F6C9A0', checkColor: '#1E3A52' },
  { value: 'medium-light', label: 'médio claro', swatch: '#E3AD82', checkColor: '#1E3A52' },
  { value: 'medium', label: 'médio', swatch: '#C68B5E', checkColor: '#1E3A52' },
  { value: 'medium-dark', label: 'médio escuro', swatch: '#9C6640', checkColor: '#FFFFFF' },
  { value: 'dark', label: 'escuro', swatch: '#6B432C', checkColor: '#FFFFFF' },
];

/**
 * Starting tone of a new profile: the middle of the scale, so no tone
 * reads as the app's "default person". Profiles from before skin tones
 * existed stay "light", the tone they were drawn in (migration 008).
 */
export const DEFAULT_SKIN_TONE: SkinTone = 'medium';

export function getSkinToneOption(value: SkinTone): SkinToneOption {
  return SKIN_TONES.find((option) => option.value === value) ?? SKIN_TONES[0];
}
