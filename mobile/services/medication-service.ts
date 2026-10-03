import { getRepositories } from '@/database/repositories';
import type { MedicationRoutineInput } from '@/database/repositories';
import type { Medication } from '@/domain/types';

import { requestReminderPermissionIfUseful, syncRemindersInBackground } from './reminder-service';

export async function listMedicationsForProfile(
  profileId: string,
  options: { includeInactive?: boolean } = {}
): Promise<Medication[]> {
  const { medications } = await getRepositories();
  return medications.listByProfile(profileId, options);
}

export async function getMedication(id: string): Promise<Medication | null> {
  const { medications } = await getRepositories();
  return medications.getById(id);
}

export async function createMedication(input: MedicationRoutineInput): Promise<Medication> {
  const { medications } = await getRepositories();
  const medication = await medications.create(input);
  syncRemindersInBackground();
  // First routine saved is the natural moment to ask for permission.
  requestReminderPermissionIfUseful().catch((error) => {
    console.warn('DoseCare: could not request notification permission.', error);
  });
  return medication;
}

export async function updateMedication(id: string, input: MedicationRoutineInput): Promise<void> {
  const { medications } = await getRepositories();
  await medications.update(id, input);
  syncRemindersInBackground();
}

/** Deactivate/reactivate — the medication and its history are never deleted. */
export async function setMedicationActive(id: string, active: boolean): Promise<void> {
  const { medications } = await getRepositories();
  await medications.setActive(id, active);
  syncRemindersInBackground();
}
