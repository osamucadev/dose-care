import * as stockService from '@/services/stock-service';

import { useAsyncData } from './use-async-data';

/** Medications, across all profiles, whose stock is at or below the low threshold. */
export function useRestockItems(refreshKey: unknown) {
  const { data, loading, error, refresh } = useAsyncData(() => stockService.listRestockItems(), [refreshKey]);
  return { restockItems: data ?? [], loading, error, refresh };
}
