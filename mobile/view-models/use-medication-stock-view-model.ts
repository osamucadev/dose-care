import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { LOW_STOCK_RATIO, type StockStatus } from '@/domain/stock';
import { MAX_STOCK_DOSES } from '@/domain/validation';
import { useMedication } from '@/hooks/use-medication';
import { useStockStatuses } from '@/hooks/use-stock-statuses';
import * as stockService from '@/services/stock-service';

export type MedicationStockViewModel =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready';
      medicationLabel: string;
      /** Current stock, or null when this is the first count. */
      current: StockStatus | null;
      lowStockPercent: number;
      saving: boolean;
      hasSubmitError: boolean;
      dismissSubmitError: () => void;
      /** Validates the typed amount; returns an error message, or null when it was saved. */
      submit: (dosesOnHandText: string) => Promise<string | null>;
    };

/** Parses what the user typed as a whole, non-negative number of doses. */
export function parseDosesOnHand(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value <= MAX_STOCK_DOSES ? value : null;
}

export function useMedicationStockViewModel(medicationId: string): MedicationStockViewModel {
  const router = useRouter();
  const { medication, loading, error, refresh } = useMedication(medicationId);
  const medications = useMemo(() => (medication ? [medication] : []), [medication]);
  const { stockByMedication, loading: stockLoading } = useStockStatuses(medications, null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  if (loading || (medication && stockLoading)) return { status: 'loading' };
  if (error || !medication) return { status: 'error', retry: refresh };

  return {
    status: 'ready',
    medicationLabel: medication.dosage ? `${medication.name} ${medication.dosage}` : medication.name,
    current: stockByMedication[medication.id] ?? null,
    lowStockPercent: Math.round(LOW_STOCK_RATIO * 100),
    saving,
    hasSubmitError: submitError !== null,
    dismissSubmitError: () => setSubmitError(null),
    submit: async (text) => {
      const doses = parseDosesOnHand(text);
      if (doses === null) return 'Informe um número inteiro de doses.';
      setSaving(true);
      try {
        await stockService.recordStockCount(medication.id, doses);
        router.back();
        return null;
      } catch (err) {
        setSubmitError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setSaving(false);
      }
    },
  };
}
