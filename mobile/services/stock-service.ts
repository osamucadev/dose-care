import * as Crypto from 'expo-crypto';

import { getRepositories } from '@/database/repositories';
import { nowUtcIso } from '@/domain/datetime';

import { syncRemindersInBackground } from './reminder-service';

export { getStockStatuses, listRestockItems } from './stock-queries';

/**
 * Records how many doses are on hand right now, after buying more or
 * recounting. It becomes the new base for the low-stock threshold, and
 * reminders are re-planned so restock reminders stop (or start).
 */
export async function recordStockCount(medicationId: string, dosesOnHand: number): Promise<void> {
  const { stock } = await getRepositories();
  const timestamp = nowUtcIso();
  await stock.create({
    id: Crypto.randomUUID(),
    medicationId,
    dosesOnHand,
    countedAt: timestamp,
    createdAt: timestamp,
  });
  syncRemindersInBackground();
}
