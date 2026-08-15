import type { DoseEventCandidate } from '../validation';
import {
  InvalidPersistedDataError,
  assertValidDoseEvent,
  assertValidMedicationInput,
  assertValidProfileInput,
  isValidDoseEventStatus,
  isValidProfileType,
  parseMedicationTimes,
} from '../validation';

describe('parseMedicationTimes', () => {
  it('parses a valid JSON array of times, deduplicated and sorted', () => {
    expect(parseMedicationTimes('["20:00","08:00","08:00"]')).toEqual(['08:00', '20:00']);
  });

  it('rejects corrupted JSON', () => {
    expect(() => parseMedicationTimes('not json')).toThrow(InvalidPersistedDataError);
  });

  it('rejects a JSON value that is not an array', () => {
    expect(() => parseMedicationTimes('"08:00"')).toThrow(InvalidPersistedDataError);
    expect(() => parseMedicationTimes('{"time":"08:00"}')).toThrow(InvalidPersistedDataError);
  });

  it('rejects an empty array', () => {
    expect(() => parseMedicationTimes('[]')).toThrow(InvalidPersistedDataError);
  });

  it('rejects an array containing an invalid time string', () => {
    expect(() => parseMedicationTimes('["08:00","25:99"]')).toThrow(InvalidPersistedDataError);
  });

  it('rejects an array containing a non-string element', () => {
    expect(() => parseMedicationTimes('["08:00", 800]')).toThrow(InvalidPersistedDataError);
  });
});

describe('isValidProfileType / isValidDoseEventStatus', () => {
  it('accepts only the known profile types', () => {
    expect(isValidProfileType('pet')).toBe(true);
    expect(isValidProfileType('robot')).toBe(false);
  });

  it('accepts only "taken"/"skipped" as dose event statuses', () => {
    expect(isValidDoseEventStatus('taken')).toBe(true);
    expect(isValidDoseEventStatus('skipped')).toBe(true);
    expect(isValidDoseEventStatus('pending')).toBe(false);
  });
});

describe('assertValidMedicationInput', () => {
  it('returns times deduplicated and sorted when the input is valid', () => {
    const result = assertValidMedicationInput({
      name: 'Losartana',
      times: ['20:00', '08:00', '08:00'],
      startDate: '2026-08-15',
    });
    expect(result).toEqual(['08:00', '20:00']);
  });

  it('rejects a blank name', () => {
    expect(() =>
      assertValidMedicationInput({ name: '   ', times: ['08:00'], startDate: '2026-08-15' })
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects an empty times list', () => {
    expect(() =>
      assertValidMedicationInput({ name: 'Losartana', times: [], startDate: '2026-08-15' })
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects an invalid time', () => {
    expect(() =>
      assertValidMedicationInput({ name: 'Losartana', times: ['8h'], startDate: '2026-08-15' })
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects an invalid start date', () => {
    expect(() =>
      assertValidMedicationInput({ name: 'Losartana', times: ['08:00'], startDate: '2026-02-30' })
    ).toThrow(InvalidPersistedDataError);
  });
});

describe('assertValidProfileInput', () => {
  it('accepts a valid profile input', () => {
    expect(() => assertValidProfileInput({ name: 'Florita', type: 'elderly' })).not.toThrow();
  });

  it('rejects a blank name', () => {
    expect(() => assertValidProfileInput({ name: '  ', type: 'elderly' })).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an unknown profile type', () => {
    expect(() => assertValidProfileInput({ name: 'Florita', type: 'robot' })).toThrow(
      InvalidPersistedDataError
    );
  });
});

function makeDoseEventCandidate(overrides: Partial<DoseEventCandidate> = {}): DoseEventCandidate {
  return {
    id: 'event-1',
    profileId: 'profile-1',
    medicationId: 'med-1',
    medicationNameSnapshot: 'Losartana',
    dosageSnapshot: '50 mg',
    quantitySnapshot: '1 comprimido',
    scheduledAt: '2026-08-15T08:00',
    occurredAt: '2026-08-15T11:03:12.000Z',
    status: 'taken',
    createdAt: '2026-08-15T11:03:12.000Z',
    ...overrides,
  };
}

describe('assertValidDoseEvent', () => {
  it('accepts a well-formed DoseEvent', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate())).not.toThrow();
  });

  it('rejects an empty id', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ id: '' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an empty profileId', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ profileId: '  ' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an empty medicationId', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ medicationId: '' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an empty medicationNameSnapshot', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ medicationNameSnapshot: '   ' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects a status outside "taken"/"skipped" at runtime, even though TS types it away', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ status: 'pending' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects a scheduledAt that merely looks like the right shape', () => {
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ scheduledAt: '2026-02-30T08:00' }))).toThrow(
      InvalidPersistedDataError
    );
    expect(() => assertValidDoseEvent(makeDoseEventCandidate({ scheduledAt: '2026-08-15 08:00' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an occurredAt that is not a valid UTC ISO timestamp', () => {
    expect(() =>
      assertValidDoseEvent(makeDoseEventCandidate({ occurredAt: '2026-08-15T11:03:12' }))
    ).toThrow(InvalidPersistedDataError);
    expect(() =>
      assertValidDoseEvent(makeDoseEventCandidate({ occurredAt: '2026-13-01T00:00:00.000Z' }))
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects a createdAt that is not a valid UTC ISO timestamp', () => {
    expect(() =>
      assertValidDoseEvent(makeDoseEventCandidate({ createdAt: 'not a timestamp' }))
    ).toThrow(InvalidPersistedDataError);
  });
});
