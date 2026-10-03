import { PROFILE_TYPES } from '@/theme/profile-types';
import { createTestDatabase, type NodeDatabase } from '@/test/node-sqlite';

import { migrations } from '../migrations';
import { LEGACY_EMOJI_AVATARS } from '../migrations/004_svg_avatars';

const databaseAtVersion = createTestDatabase;

function insertProfile(db: NodeDatabase, id: string, type: string, avatar: string) {
  db.prepare(
    "INSERT INTO profiles (id, name, type, avatar, color, created_at) VALUES (?, 'Nome', ?, ?, '#000000', '2026-08-01T00:00:00.000Z')"
  ).run(id, type, avatar);
}

function avatarOf(db: NodeDatabase, id: string): string {
  return (db.prepare('SELECT avatar FROM profiles WHERE id = ?').get(id) as { avatar: string }).avatar;
}

describe('migration 004: emoji avatars to svg', () => {
  const upgrade = migrations.find((m) => m.version === 4)!;

  it('maps every legacy emoji to its illustration', () => {
    const db = databaseAtVersion(3);
    Object.keys(LEGACY_EMOJI_AVATARS).forEach((emoji, index) => insertProfile(db, `p${index}`, 'adult', emoji));

    db.exec(upgrade.up);

    Object.values(LEGACY_EMOJI_AVATARS).forEach((key, index) => expect(avatarOf(db, `p${index}`)).toBe(key));
  });

  it('keeps avatars that are already illustrations', () => {
    const db = databaseAtVersion(3);
    insertProfile(db, 'cat', 'pet', 'svg:cat');
    db.exec(upgrade.up);
    expect(avatarOf(db, 'cat')).toBe('svg:cat');
  });

  it("falls back to the type's default illustration for anything unknown", () => {
    const db = databaseAtVersion(3);
    PROFILE_TYPES.forEach((meta) => insertProfile(db, meta.type, meta.type, '🦄'));
    db.exec(upgrade.up);
    PROFILE_TYPES.forEach((meta) => expect(avatarOf(db, meta.type)).toBe(meta.defaultAvatar));
  });

  it('maps only to avatars the picker offers', () => {
    const offered = new Set(PROFILE_TYPES.flatMap((meta) => meta.avatarOptions));
    Object.values(LEGACY_EMOJI_AVATARS).forEach((key) => expect(offered.has(key)).toBe(true));
  });
});
