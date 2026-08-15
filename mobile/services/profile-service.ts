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
