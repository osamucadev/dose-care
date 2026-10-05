import type { DoseEvent, Medication } from './types';

export interface HistoryEntry {
  event: DoseEvent;
  /** The medication's current name, so a renamed medication is recognized in its history. */
  medicationName: string;
  /**
   * The name stored in the event when it differs from the current one, so
   * the screen can say what the dose was recorded as. Null when unchanged.
   */
  recordedAsName: string | null;
}

/**
 * Pairs each DoseEvent with its medication's current name, for display.
 * Nothing is rewritten: the event keeps its snapshot, and the snapshot
 * name stays visible ("Registrado como ...") whenever it differs. The
 * dosage is intentionally not replaced: what was taken at the time is
 * what the history must show. Events of a medication that no longer
 * exists keep their snapshot name.
 */
export function buildHistoryEntries(events: DoseEvent[], medications: Medication[]): HistoryEntry[] {
  const currentNameById = new Map(medications.map((m) => [m.id, m.name]));
  return events.map((event) => {
    const current = currentNameById.get(event.medicationId)?.trim();
    const recorded = event.medicationNameSnapshot;
    if (!current || current === recorded.trim()) {
      return { event, medicationName: recorded, recordedAsName: null };
    }
    return { event, medicationName: current, recordedAsName: recorded };
  });
}
