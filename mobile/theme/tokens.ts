export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
} as const;

/** Soft, low-contrast card shadow shared by every elevated surface. */
export const shadow = {
  shadowColor: '#1E3A52',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

/** Minimum touch target side, per accessibility guidance (44x44 iOS / 48x48 Android). */
export const minTouchTarget = 48;
