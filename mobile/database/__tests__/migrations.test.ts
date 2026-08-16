import { migrations } from '../migrations';

describe('migrations index', () => {
  it('lists every migration in ascending version order, starting at 1', () => {
    expect(migrations.map((m) => m.version)).toEqual([1, 2, 3]);
  });

  it('keeps migration 001 exactly as the initial schema — no active column on profiles', () => {
    const initial = migrations[0];
    expect(initial.version).toBe(1);
    expect(initial.name).toBe('initial_schema');

    const profilesBlock = /CREATE TABLE IF NOT EXISTS profiles\s*\(([\s\S]*?)\);/.exec(initial.up);
    expect(profilesBlock).not.toBeNull();
    expect(profilesBlock![1]).not.toMatch(/active/i);

    // Sanity: the other two tables from 001 are still there too, and
    // medications' shape from 001 has no treatment-end columns yet.
    const medicationsBlock = /CREATE TABLE IF NOT EXISTS medications\s*\(([\s\S]*?)\);/.exec(initial.up);
    expect(medicationsBlock).not.toBeNull();
    expect(medicationsBlock![1]).not.toMatch(/end_mode|end_date|total_scheduled_doses/i);
    expect(initial.up).toContain('CREATE TABLE IF NOT EXISTS dose_events');
  });

  it('migration 002 only adds Profile.active, with a safe default and a self-contained CHECK', () => {
    const second = migrations[1];
    expect(second.version).toBe(2);
    expect(second.up).toMatch(/ALTER TABLE profiles ADD COLUMN active INTEGER NOT NULL DEFAULT 1/i);
    expect(second.up).toMatch(/CHECK\s*\(\s*active\s+IN\s*\(\s*0\s*,\s*1\s*\)\s*\)/i);
    // Only touches `profiles` — never medications or dose_events.
    expect(second.up).not.toMatch(/CREATE TABLE|medications|dose_events/i);
  });

  it('migration 003 adds the three treatment-end fields to medications, defaulting existing rows to ongoing', () => {
    const third = migrations[2];
    expect(third.version).toBe(3);
    expect(third.up).toMatch(/ALTER TABLE medications ADD COLUMN end_mode TEXT NOT NULL DEFAULT 'ongoing'/i);
    expect(third.up).toMatch(/CHECK\s*\(\s*end_mode\s+IN\s*\(\s*'ongoing'\s*,\s*'end_date'\s*,\s*'dose_count'\s*\)\s*\)/i);
    expect(third.up).toMatch(/ALTER TABLE medications ADD COLUMN end_date TEXT/i);
    expect(third.up).toMatch(/ALTER TABLE medications ADD COLUMN total_scheduled_doses INTEGER/i);
    expect(third.up).toMatch(/total_scheduled_doses IS NULL OR total_scheduled_doses > 0/i);
    // Only touches `medications` — never profiles or dose_events, and
    // never recreates a table just to add a combined constraint.
    expect(third.up).not.toMatch(/CREATE TABLE|DROP TABLE|profiles\s|dose_events/i);
  });
});
