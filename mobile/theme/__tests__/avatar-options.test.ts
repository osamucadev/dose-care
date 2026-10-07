import { AVATAR_ART } from '@/assets/svg/avatars';
import { avatarAccessibilityLabel } from '@/components/ui/avatar';
import { SKIN_TONE_VALUES } from '@/domain/types';

import { PROFILE_TYPES } from '../profile-types';

describe.each(PROFILE_TYPES.map((meta) => [meta.label, meta] as const))('%s avatars', (_, meta) => {
  it('offers the default avatar among its options', () => {
    expect(meta.avatarOptions).toContain(meta.defaultAvatar);
  });

  it.each(meta.avatarOptions)('%s has art and a spoken name', (avatar) => {
    const art = AVATAR_ART[avatar];
    if (meta.hasSkinTone) {
      expect(typeof art).toBe('object');
      SKIN_TONE_VALUES.forEach((tone) => expect((art as Record<string, unknown>)[tone]).toBeDefined());
    } else {
      expect(typeof art).toBe('function');
    }
    expect(avatarAccessibilityLabel(avatar)).not.toContain('svg:');
  });
});
