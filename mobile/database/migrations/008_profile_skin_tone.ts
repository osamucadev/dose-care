import type { Migration } from './types';

/**
 * Skin tone of the people avatars, chosen apart from the avatar itself.
 * Every existing profile keeps the tone its avatar was drawn in until
 * then ("light"); new profiles get their default from the form.
 */
export const profileSkinTone: Migration = {
  version: 8,
  name: 'add_profile_skin_tone',
  up: `
    ALTER TABLE profiles ADD COLUMN skin_tone TEXT NOT NULL DEFAULT 'light'
      CHECK (skin_tone IN ('light', 'medium-light', 'medium', 'medium-dark', 'dark'));
  `,
};
