import { getDatabase } from '../client';
import { DoseEventRepository } from './dose-event-repository';
import { MedicationRepository } from './medication-repository';
import { PendingDoseActionRepository } from './pending-dose-action-repository';
import { ProfileRepository } from './profile-repository';
import { StockRepository } from './stock-repository';

export { DoseAlreadyResolvedError, DoseEventRepository } from './dose-event-repository';
export type { MedicationRoutineInput } from './medication-repository';
export { MedicationRepository } from './medication-repository';
export type { CreateProfileInput, UpdateProfileInput } from './profile-repository';
export { PendingDoseActionRepository } from './pending-dose-action-repository';
export { ProfileRepository } from './profile-repository';
export { StockRepository } from './stock-repository';

export interface Repositories {
  profiles: ProfileRepository;
  medications: MedicationRepository;
  doseEvents: DoseEventRepository;
  stock: StockRepository;
  pendingDoseActions: PendingDoseActionRepository;
}

let repositoriesPromise: Promise<Repositories> | null = null;

/** Lazily builds the app's repositories on top of the single shared DB connection. */
export function getRepositories(): Promise<Repositories> {
  if (!repositoriesPromise) {
    repositoriesPromise = getDatabase().then((db) => ({
      profiles: new ProfileRepository(db),
      medications: new MedicationRepository(db),
      doseEvents: new DoseEventRepository(db),
      stock: new StockRepository(db),
      pendingDoseActions: new PendingDoseActionRepository(db),
    }));
  }
  return repositoriesPromise;
}
