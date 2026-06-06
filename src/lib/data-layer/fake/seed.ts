// Deterministic seeded faker instance + low-level generation helpers.
//
// The whole fake-data layer is built on ONE seeded faker so every run of the
// app (and the fixtures script) produces byte-identical data. Determinism is
// what lets the storefront and the command center agree on ids, prices, and
// counts without a shared database.

import { faker } from "@faker-js/faker";

// The master seed. Touch this and the entire synthetic world re-rolls.
export const MASTER_SEED = 42;

// Seed once, eagerly, at module load. Every consumer that imports `faker`
// from here gets the same deterministic stream as long as generation happens
// in a fixed order (which store.ts guarantees by building modules in sequence).
faker.seed(MASTER_SEED);

export { faker };

/**
 * Re-seed the global faker. Used by the store to (re)build the world from a
 * known starting point, and available to tests/fixtures that want to reset.
 */
export function reseed(seed: number = MASTER_SEED): void {
  faker.seed(seed);
}

/**
 * A small, stable string id with a prefix, e.g. `prd_a1b2c3d4`.
 * Uses faker's alphanumeric so it stays inside the deterministic stream.
 */
export function makeId(prefix: string, length = 8): string {
  return `${prefix}_${faker.string.alphanumeric({ length, casing: "lower" })}`;
}

/**
 * Convert a human label into a url-safe slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Deterministic weighted pick. `weights` align by index with `items`.
 */
export function weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = faker.number.float({ min: 0, max: total });
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * An ISO timestamp `daysAgo` days before `now`, with a random time-of-day.
 * Centralizes our recency model so events/orders share the same clock.
 */
export function isoDaysAgo(daysAgo: number, now: Date = REFERENCE_NOW): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(
    faker.number.int({ min: 0, max: 23 }),
    faker.number.int({ min: 0, max: 59 }),
    faker.number.int({ min: 0, max: 59 }),
    0,
  );
  return d.toISOString();
}

/**
 * A fixed "now" so 7d/30d/60d windows are stable across runs. We anchor to a
 * concrete instant rather than `new Date()` to keep fixtures reproducible.
 * The storefront/command-center treat this as the present.
 */
export const REFERENCE_NOW = new Date("2026-06-03T17:00:00.000Z");
