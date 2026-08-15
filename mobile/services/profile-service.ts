import { getRepositories } from '@/database/repositories';
import type { CreateProfileInput, UpdateProfileInput } from '@/database/repositories';
import type { Profile } from '@/domain/types';

export async function listProfiles(): Promise<Profile[]> {
  const { profiles } = await getRepositories();
  return profiles.listAll();
}

export async function getProfile(id: string): Promise<Profile | null> {
  const { profiles } = await getRepositories();
  return profiles.getById(id);
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const { profiles } = await getRepositories();
  return profiles.create(input);
}

export async function updateProfile(id: string, input: UpdateProfileInput): Promise<void> {
  const { profiles } = await getRepositories();
  await profiles.update(id, input);
}

/**
 * Soft-delete: the UI presents this as "Excluir perfil," but it only
 * flips `active` to false. The profile row, its medications and its
 * DoseEvents all remain in the database — nothing is physically
 * deleted, and no foreign key here cascades a delete.
 */
export async function deactivateProfile(id: string): Promise<void> {
  const { profiles } = await getRepositories();
  await profiles.setActive(id, false);
}
