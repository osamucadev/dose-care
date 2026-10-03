/**
 * App palette. Teal primary, navy text and a warm cream background, taken
 * from the visual prototype. Soft fills (`tintSoft`, `warmSoft`) are for
 * calm highlights only; nothing here is meant to read as an alarm.
 *
 * Contrast (WCAG 2.1 AA): every text color here (`text`, `textMuted`,
 * `tint`, `success`, `danger`) reaches at least 4.5:1 on `background`,
 * `surface`, `tintSoft`, `warmSoft` and every profile type tint in
 * `theme/profile-types.ts`. `inputBorder` reaches 3:1 against `surface`,
 * as required for the boundary of a form control. `border` is for
 * decorative dividers and card edges only.
 */
export const Colors = {
  light: {
    text: '#1E3A52',
    textMuted: '#526274',
    background: '#FEFAF2',
    surface: '#FFFFFF',
    border: '#E8E2D6',
    /** Boundary of text inputs and pickers: needs 3:1 against `surface`. */
    inputBorder: '#7F8A95',
    tint: '#1F6F72',
    /** Text/icon color on top of a `tint` fill. */
    onTint: '#FFFFFF',
    /** Very soft teal for selected states and the "Agora" card. */
    tintSoft: '#E3F3EF',
    /** Soft warm fill used behind dose times. */
    warmSoft: '#FDF3DC',
    icon: '#526274',
    success: '#23704F',
    danger: '#9E4552',
  },
  dark: {
    text: '#E8EEF2',
    textMuted: '#A3B1BC',
    background: '#121A1C',
    surface: '#1B2629',
    border: '#2B3A3E',
    inputBorder: '#6B7D85',
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
