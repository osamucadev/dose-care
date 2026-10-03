/**
 * App palette. Teal primary, navy text and a warm cream background, taken
 * from the visual prototype. Soft fills (`tintSoft`, `warmSoft`) are for
 * calm highlights only; nothing here is meant to read as an alarm.
 */
export const Colors = {
  light: {
    text: '#1E3A52',
    textMuted: '#5F7184',
    background: '#FEFAF2',
    surface: '#FFFFFF',
    border: '#E8E2D6',
    tint: '#267C7F',
    /** Text/icon color on top of a `tint` fill. */
    onTint: '#FFFFFF',
    /** Very soft teal for selected states and the "Agora" card. */
    tintSoft: '#E3F3EF',
    /** Soft warm fill used behind dose times. */
    warmSoft: '#FDF3DC',
    icon: '#5F7184',
    success: '#2F8A63',
    danger: '#B5606B',
  },
  dark: {
    text: '#E8EEF2',
    textMuted: '#A3B1BC',
    background: '#121A1C',
    surface: '#1B2629',
    border: '#2B3A3E',
    tint: '#6CC3BF',
    onTint: '#0E2A2B',
    tintSoft: '#1D3637',
    warmSoft: '#352E20',
    icon: '#A3B1BC',
    success: '#79C79A',
    danger: '#E09AA4',
  },
};

export type ThemeColorName = keyof typeof Colors.light & keyof typeof Colors.dark;
