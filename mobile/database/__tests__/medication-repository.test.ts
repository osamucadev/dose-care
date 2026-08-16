import type { SQLiteDatabase } from 'expo-sqlite';

import { InvalidPersistedDataError } from '@/domain/validation';

import type { MedicationRoutineInput } from '../repositories/medication-repository';
import { MedicationRepository } from '../repositories/medication-repository';

function fakeDb() {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as SQLiteDatabase & { getAllAsync: jest.Mock; getFirstAsync: jest.Mock; runAsync: jest.Mock };
}

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'med-1',
    profile_id: 'profile-1',
    name: 'Losartana',
    dosage: '50 mg',
    quantity_per_dose: '1 comprimido',
    notes: null,
    times: '["08:00"]',
    start_date: '2026-08-15',
    active: 1,
    end_mode: 'ongoing',
    end_date: null,
    total_scheduled_doses: null,
    created_at: '2026-08-15T00:00:00.000Z',
    updated_at: '2026-08-15T00:00:00.000Z',
    ...overrides,
  };
}

function makeRoutineInput(overrides: Partial<MedicationRoutineInput> = {}): MedicationRoutineInput {
  return {
    profileId: 'profile-1',
    name: 'Losartana',
    times: ['08:00'],
    startDate: '2026-08-15',
    endMode: 'ongoing',
    ...overrides,
  };
}

/**
 * Reads back the end-mode fields from the args passed to `runAsync` by
 * `MedicationRepository.create` — positional, matching the column list
 * in the INSERT (`id, profile_id, name, dosage, quantity_per_dose,
 * notes, times, start_date, active, end_mode, end_date,
 * total_scheduled_doses, created_at, updated_at`; `active` is a SQL
 * literal, not a bound `?`, so it consumes no argument slot).
 */
function getCreatedEndFields(db: ReturnType<typeof fakeDb>) {
  const args = db.runAsync.mock.calls[0];
  return { endMode: args[9], endDate: args[10], totalScheduledDoses: args[11] };
}

describe('MedicationRepository.listActiveForAllProfiles', () => {
  it('guards against an inactive profile via an EXISTS subquery, not just medications.active', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listActiveForAllProfiles();

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).toMatch(/m\.active\s*=\s*1/);
    expect(sql).toMatch(/EXISTS\s*\(/i);
    expect(sql).toMatch(/FROM\s+profiles\s+p/i);
    expect(sql).toMatch(/p\.active\s*=\s*1/);
    expect(sql).toMatch(/p\.id\s*=\s*m\.profile_id/i);
  });
});

describe('MedicationRepository.listByProfile', () => {
  it('filters to active medications by default', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listByProfile('profile-1');

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).toMatch(/active\s*=\s*1/);
  });

  it('includes inactive medications when explicitly requested', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listByProfile('profile-1', { includeInactive: true });

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).not.toMatch(/active\s*=\s*1/);
  });
});

describe('MedicationRepository read path — toMedication', () => {
  it('reads an existing (pre-migration-003-shaped) row as ongoing', async () => {
    const db = fakeDb();
    db.getFirstAsync.mockResolvedValue(makeRow()); // end_mode: 'ongoing', end_date/total_scheduled_doses: null
    const repo = new MedicationRepository(db);

    const medication = await repo.getById('med-1');

    expect(medication?.endMode).toBe('ongoing');
    expect(medication?.endDate).toBeNull();
    expect(medication?.totalScheduledDoses).toBeNull();
  });

  it('reads a valid end_date row correctly', async () => {
    const db = fakeDb();
    db.getFirstAsync.mockResolvedValue(
      makeRow({ end_mode: 'end_date', end_date: '2026-08-22' })
    );
    const repo = new MedicationRepository(db);

    const medication = await repo.getById('med-1');

    expect(medication?.endMode).toBe('end_date');
    expect(medication?.endDate).toBe('2026-08-22');
  });

  it('reads a valid dose_count row correctly', async () => {
    const db = fakeDb();
    db.getFirstAsync.mockResolvedValue(
      makeRow({ end_mode: 'dose_count', total_scheduled_doses: 6 })
    );
    const repo = new MedicationRepository(db);

    const medication = await repo.getById('med-1');

    expect(medication?.endMode).toBe('dose_count');
    expect(medication?.totalScheduledDoses).toBe(6);
  });

  it('rejects a corrupted row where end_mode and end_date are inconsistent', async () => {
    const db = fakeDb();
    // end_mode says 'ongoing' but end_date is set — impossible via the
    // repository's own write path, but a corrupted/edited-outside-the-app row.
    db.getFirstAsync.mockResolvedValue(makeRow({ end_date: '2026-08-22' }));
    const repo = new MedicationRepository(db);

    await expect(repo.getById('med-1')).rejects.toBeInstanceOf(InvalidPersistedDataError);
  });

  it('rejects a row with an unrecognized end_mode', async () => {
    const db = fakeDb();
    db.getFirstAsync.mockResolvedValue(makeRow({ end_mode: 'forever' }));
    const repo = new MedicationRepository(db);

    await expect(repo.getById('med-1')).rejects.toBeInstanceOf(InvalidPersistedDataError);
  });
});

describe('MedicationRepository.create', () => {
  it('writes null end_date/total_scheduled_doses for an ongoing treatment', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.create(makeRoutineInput({ endMode: 'ongoing' }));

    expect(getCreatedEndFields(db)).toEqual({ endMode: 'ongoing', endDate: null, totalScheduledDoses: null });
  });

  it('writes the end date and null total_scheduled_doses for an end_date treatment', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.create(makeRoutineInput({ endMode: 'end_date', endDate: '2026-08-22' }));

    expect(getCreatedEndFields(db)).toEqual({
      endMode: 'end_date',
      endDate: '2026-08-22',
      totalScheduledDoses: null,
    });
  });

  it('writes total_scheduled_doses and null end_date for a dose_count treatment', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.create(makeRoutineInput({ endMode: 'dose_count', totalScheduledDoses: 6 }));

    expect(getCreatedEndFields(db)).toEqual({ endMode: 'dose_count', endDate: null, totalScheduledDoses: 6 });
  });

  it('rejects — rather than silently normalizing away — an extraneous field for the wrong mode', async () => {
    // "Não permita estados ambíguos": an ongoing treatment carrying an
    // end date is rejected outright, not quietly cleaned up. The
    // normalization step only ever runs *after* validation confirms
    // the input was already consistent — it exists as defense in
    // depth, not as a way to tolerate bad input.
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await expect(
      repo.create(makeRoutineInput({ endMode: 'ongoing', endDate: '2026-08-22' }))
    ).rejects.toBeInstanceOf(InvalidPersistedDataError);
    expect(db.runAsync).not.toHaveBeenCalled();
  });

  it('rejects an invalid combination before running any SQL', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await expect(
      repo.create(makeRoutineInput({ endMode: 'dose_count', totalScheduledDoses: 0 }))
    ).rejects.toBeInstanceOf(InvalidPersistedDataError);
    expect(db.runAsync).not.toHaveBeenCalled();
  });

  it('rejects an end date before the start date before running any SQL', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await expect(
      repo.create(
        makeRoutineInput({ startDate: '2026-08-15', endMode: 'end_date', endDate: '2026-08-01' })
      )
    ).rejects.toBeInstanceOf(InvalidPersistedDataError);
    expect(db.runAsync).not.toHaveBeenCalled();
  });
});

describe('MedicationRepository.update', () => {
  it('writes the normalized end-mode fields for the new configuration', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.update('med-1', makeRoutineInput({ endMode: 'dose_count', totalScheduledDoses: 6 }));

    const [sql, ...params] = db.runAsync.mock.calls[0];
    expect(sql).toMatch(/end_mode\s*=\s*\?/);
    expect(sql).toMatch(/end_date\s*=\s*\?/);
    expect(sql).toMatch(/total_scheduled_doses\s*=\s*\?/);
    expect(params).toContain('dose_count');
    expect(params).toContain(6);
  });
});
