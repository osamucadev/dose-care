import type { DoseEventCandidate, MedicationInputToValidate, TreatmentEndModeCandidate } from '../validation';
import {
  InvalidPersistedDataError,
  MAX_TOTAL_SCHEDULED_DOSES,
  assertValidDoseEvent,
  assertValidMedicationInput,
  assertValidProfileInput,
  assertValidTreatmentEndMode,
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

function makeMedicationInput(overrides: Partial<MedicationInputToValidate> = {}): MedicationInputToValidate {
  return {
    name: 'Losartana',
    times: ['08:00'],
    startDate: '2026-08-15',
    endMode: 'ongoing',
    endDate: null,
    totalScheduledDoses: null,
    ...overrides,
  };
}

describe('assertValidMedicationInput', () => {
  it('returns times deduplicated and sorted when the input is valid', () => {
    const result = assertValidMedicationInput(makeMedicationInput({ times: ['20:00', '08:00', '08:00'] }));
    expect(result.times).toEqual(['08:00', '20:00']);
    expect(result.endMode).toBe('ongoing');
  });

  it('rejects a blank name', () => {
    expect(() => assertValidMedicationInput(makeMedicationInput({ name: '   ' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an empty times list', () => {
    expect(() => assertValidMedicationInput(makeMedicationInput({ times: [] }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an invalid time', () => {
    expect(() => assertValidMedicationInput(makeMedicationInput({ times: ['8h'] }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('rejects an invalid start date', () => {
    expect(() => assertValidMedicationInput(makeMedicationInput({ startDate: '2026-02-30' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('normalizes endDate/totalScheduledDoses to null for whichever field does not apply to endMode', () => {
    const result = assertValidMedicationInput(
      makeMedicationInput({ endMode: 'end_date', endDate: '2026-08-20' })
    );
    expect(result.endDate).toBe('2026-08-20');
    expect(result.totalScheduledDoses).toBeNull();
  });

  it('rejects an end-mode combination that assertValidTreatmentEndMode would reject', () => {
    expect(() =>
      assertValidMedicationInput(makeMedicationInput({ endMode: 'end_date', endDate: '2026-08-01' }))
    ).toThrow(InvalidPersistedDataError); // 2026-08-01 is before startDate 2026-08-15
  });
});

function makeEndModeCandidate(
  overrides: Partial<TreatmentEndModeCandidate> = {}
): TreatmentEndModeCandidate {
  return {
    endMode: 'ongoing',
    endDate: null,
    totalScheduledDoses: null,
    startDate: '2026-08-15',
    ...overrides,
  };
}

describe('assertValidTreatmentEndMode', () => {
  it('accepts ongoing with no end date and no dose count', () => {
    expect(() => assertValidTreatmentEndMode(makeEndModeCandidate())).not.toThrow();
  });

  it('rejects ongoing with an end date', () => {
    expect(() =>
      assertValidTreatmentEndMode(makeEndModeCandidate({ endDate: '2026-09-01' }))
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects ongoing with a total scheduled doses count', () => {
    expect(() =>
      assertValidTreatmentEndMode(makeEndModeCandidate({ totalScheduledDoses: 10 }))
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects an unknown end mode', () => {
    expect(() => assertValidTreatmentEndMode(makeEndModeCandidate({ endMode: 'forever' }))).toThrow(
      InvalidPersistedDataError
    );
  });

  it('accepts end_date with a valid date on/after startDate', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'end_date', endDate: '2026-08-15' })
      )
    ).not.toThrow(); // same day as startDate — inclusive, must be allowed
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'end_date', endDate: '2026-08-22' })
      )
    ).not.toThrow();
  });

  it('rejects end_date with a date before startDate', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'end_date', endDate: '2026-08-14' })
      )
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects end_date with a missing or malformed date', () => {
    expect(() =>
      assertValidTreatmentEndMode(makeEndModeCandidate({ endMode: 'end_date', endDate: null }))
    ).toThrow(InvalidPersistedDataError);
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'end_date', endDate: '2026-02-30' })
      )
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects end_date with a total scheduled doses count also set', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'end_date', endDate: '2026-09-01', totalScheduledDoses: 5 })
      )
    ).toThrow(InvalidPersistedDataError);
  });

  it('accepts dose_count with a positive integer', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'dose_count', totalScheduledDoses: 6 })
      )
    ).not.toThrow();
  });

  it('rejects dose_count with a zero, negative, or non-integer count', () => {
    for (const value of [0, -1, 1.5]) {
      expect(() =>
        assertValidTreatmentEndMode(
          makeEndModeCandidate({ endMode: 'dose_count', totalScheduledDoses: value })
        )
      ).toThrow(InvalidPersistedDataError);
    }
  });

  it('rejects dose_count with a missing count', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'dose_count', totalScheduledDoses: null })
      )
    ).toThrow(InvalidPersistedDataError);
  });

  it('rejects dose_count above the maximum', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({
          endMode: 'dose_count',
          totalScheduledDoses: MAX_TOTAL_SCHEDULED_DOSES + 1,
        })
      )
    ).toThrow(InvalidPersistedDataError);
  });

  it('accepts dose_count exactly at the maximum', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'dose_count', totalScheduledDoses: MAX_TOTAL_SCHEDULED_DOSES })
      )
    ).not.toThrow();
  });

  it('rejects dose_count with an end date also set', () => {
    expect(() =>
      assertValidTreatmentEndMode(
        makeEndModeCandidate({ endMode: 'dose_count', totalScheduledDoses: 6, endDate: '2026-09-01' })
      )
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
