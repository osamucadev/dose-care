import { Colors } from '@/constants/theme';

import { PROFILE_TYPES } from '../profile-types';
import { SKIN_TONES } from '../skin-tones';

/** WCAG 2.1 relative luminance of a "#RRGGBB" color. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const TEXT_MIN = 4.5;
const UI_BOUNDARY_MIN = 3;

const TEXT_COLORS = ['text', 'textMuted', 'tint', 'success', 'danger'] as const;
const TEXT_BACKGROUNDS = ['background', 'surface', 'tintSoft', 'warmSoft'] as const;

describe.each(['light', 'dark'] as const)('%s palette contrast', (scheme) => {
  const palette = Colors[scheme];

  it.each(TEXT_COLORS.flatMap((fg) => TEXT_BACKGROUNDS.map((bg) => [fg, bg] as const)))(
    '%s text on %s reaches AA',
    (fg, bg) => {
      expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(TEXT_MIN);
    }
  );

  it('primary button label on tint reaches AA', () => {
    expect(contrastRatio(palette.onTint, palette.tint)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it('undo snackbar (inverted: page background and soft tint on the text color) reaches AA', () => {
    expect(contrastRatio(palette.background, palette.text)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrastRatio(palette.tintSoft, palette.text)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it('input boundary is distinguishable from its fill', () => {
    expect(contrastRatio(palette.inputBorder, palette.surface)).toBeGreaterThanOrEqual(UI_BOUNDARY_MIN);
  });

  it('icons are distinguishable from surfaces', () => {
    expect(contrastRatio(palette.icon, palette.surface)).toBeGreaterThanOrEqual(UI_BOUNDARY_MIN);
  });
});

describe('profile type tints (light mode card and chip fills)', () => {
  const palette = Colors.light;

  it.each(PROFILE_TYPES.flatMap((meta) => TEXT_COLORS.map((fg) => [fg, meta.label, meta.tint] as const)))(
    '%s text on the %s tint reaches AA',
    (fg, _label, tint) => {
      expect(contrastRatio(palette[fg], tint)).toBeGreaterThanOrEqual(TEXT_MIN);
    }
  );
});

describe('profile accent colors (dark mode card borders)', () => {
  it.each(PROFILE_TYPES.map((meta) => [meta.label, meta.color] as const))(
    '%s accent stands out from the dark background',
    (_label, color) => {
      expect(contrastRatio(color, Colors.dark.background)).toBeGreaterThanOrEqual(UI_BOUNDARY_MIN);
    }
  );
});

describe('skin tone swatches', () => {
  it.each(SKIN_TONES.map((tone) => [tone.label, tone] as const))(
    'the selected check stands out on the %s swatch',
    (_, tone) => {
      expect(contrastRatio(tone.checkColor, tone.swatch)).toBeGreaterThanOrEqual(UI_BOUNDARY_MIN);
    }
  );
});
