import { getRepositories } from '@/database/repositories';
import type { RestockItem } from '@/domain/reminders';
import { computeStockStatus, needsRestock, type StockStatus } from '@/domain/stock';
import type { Medication } from '@/domain/types';

/**
 * Current stock of each given medication that has ever been counted;
 * medications without a count are absent (stock is not being tracked).
 * Read-only on purpose: reminder-service depends on it, and writes that
 * must re-sync reminders live in stock-service.
 */
export async function getStockStatuses(medications: Medication[]): Promise<Record<string, StockStatus>> {
  const { stock, doseEvents } = await getRepositories();
  const latest = await stock.latestByMedication(medications.map((m) => m.id));

  const entries = await Promise.all(
    medications
      .filter((m) => latest[m.id])
      .map(async (m) => {
        const count = latest[m.id];
        const taken = await doseEvents.countTakenSince(m.id, count.countedAt);
        return [m.id, computeStockStatus(count, taken, m.times.length)] as const;
      })
  );
  return Object.fromEntries(entries);
}

/** Active medications of active profiles whose stock is at or below the low threshold. */
export async function listRestockItems(): Promise<RestockItem[]> {
  const { medications } = await getRepositories();
  const active = await medications.listActiveForAllProfiles();
  const statuses = await getStockStatuses(active);

  return active
    .filter((m) => statuses[m.id] && needsRestock(statuses[m.id]))
    .map((m) => ({
      medicationId: m.id,
      profileId: m.profileId,
      medicationName: m.name,
      dosage: m.dosage,
      status: statuses[m.id],
    }));
}
