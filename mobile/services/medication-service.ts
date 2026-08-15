import { getRepositories } from '@/database/repositories';
import type { MedicationRoutineInput } from '@/database/repositories';
import type { Medication } from '@/domain/types';

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
  return medications.create(input);
}

export async function updateMedication(id: string, input: MedicationRoutineInput): Promise<void> {
  const { medications } = await getRepositories();
  await medications.update(id, input);
}

/** Deactivate/reactivate — the medication and its history are never deleted. */
export async function setMedicationActive(id: string, active: boolean): Promise<void> {
  const { medications } = await getRepositories();
  await medications.setActive(id, active);
}
