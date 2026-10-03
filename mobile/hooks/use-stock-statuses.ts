import type { StockStatus } from '@/domain/stock';
import type { Medication } from '@/domain/types';
import * as stockService from '@/services/stock-service';

import { useAsyncData } from './use-async-data';

/**
 * Current stock of the given medications, keyed by medication id.
 * `refreshKey` should change whenever doses may have been taken (e.g. the
 * occurrences array), since every taken dose consumes stock.
 */
export function useStockStatuses(medications: Medication[], refreshKey: unknown) {
  const { data, loading, error, refresh } = useAsyncData(
    () => stockService.getStockStatuses(medications),
    [medications, refreshKey]
  );
  return { stockByMedication: data ?? ({} as Record<string, StockStatus>), loading, error, refresh };
}
