import * as medicationService from '@/services/medication-service';

import { useAsyncData } from './use-async-data';

/** A single medication by id — used by the medication edit screen. */
export function useMedication(id: string | undefined) {
  const { data, loading, error, refresh } = useAsyncData(
    () => (id ? medicationService.getMedication(id) : Promise.resolve(null)),
    [id]
  );

  return { medication: data, loading, error, refresh };
}
