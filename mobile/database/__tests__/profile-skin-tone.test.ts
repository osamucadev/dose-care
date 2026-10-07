import { asExpoDatabase, createTestDatabase } from '@/test/node-sqlite';

import { migrations } from '../migrations';
import { ProfileRepository } from '../repositories/profile-repository';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'profile-1' }));

const skinToneMigration = migrations.find((m) => m.version === 8)!;

describe('migration 008 (profile skin tone)', () => {
  it('keeps existing profiles in the tone their avatar was drawn in', () => {
    const db = createTestDatabase(7);
    db.exec(`INSERT INTO profiles (id, name, type, avatar, color, created_at)
             VALUES ('p1', 'Florita', 'elderly', 'svg:elderly', '#8F6FBF', '2026-08-01T00:00:00.000Z');`);

    db.exec(skinToneMigration.up);

    expect(db.prepare('SELECT skin_tone FROM profiles WHERE id = ?;').get('p1')).toEqual({ skin_tone: 'light' });
  });

  it('rejects an unknown tone', () => {
    const db = createTestDatabase();

    expect(() =>
      db.exec(`INSERT INTO profiles (id, name, type, avatar, skin_tone, color, created_at)
               VALUES ('p1', 'Florita', 'elderly', 'svg:elderly', 'blue', '#8F6FBF', '2026-08-01T00:00:00.000Z');`)
    ).toThrow();
  });
});

describe('ProfileRepository skin tone', () => {
  it('saves and reads back the chosen tone', async () => {
    const repo = new ProfileRepository(asExpoDatabase(createTestDatabase()));
    const input = { name: 'Florita', type: 'elderly' as const, avatar: 'svg:elderly', color: '#8F6FBF' };

    const created = await repo.create({ ...input, skinTone: 'medium' });
    expect((await repo.getById(created.id))?.skinTone).toBe('medium');

    await repo.update(created.id, { ...input, skinTone: 'dark' });
    expect((await repo.getById(created.id))?.skinTone).toBe('dark');
  });
});
