import { initialSchema } from './001_initial';
import type { Migration } from './types';

/**
 * Ordered list of every schema migration ever shipped. New migrations
 * are appended here with an incrementing `version`; existing entries
 * must never be edited once released, so upgrades never re-run or skip
 * a step on a device that already applied it.
 */
export const migrations: Migration[] = [initialSchema];

export type { Migration };
