// Writes JSON snapshots of the seeded world to /fixtures for human inspection.
// Uses the SAME seed/path as the running app (via the data-layer seam), so the
// fixtures are exactly what the storefront and command center see at boot.
//
// Run: pnpm run seed   (alias: pnpm run generate:fixtures)

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotWorld } from "../src/lib/data-layer/index";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "..", "fixtures");

function writeJson(name: string, data: unknown): void {
  const file = resolve(FIXTURES_DIR, `${name}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  return;
}

function main(): void {
  mkdirSync(FIXTURES_DIR, { recursive: true });

  const { collections, products, customers, orders } = snapshotWorld();

  writeJson("collections", collections);
  writeJson("products", products);
  writeJson("customers", customers);
  writeJson("orders", orders);

  // A small console summary so the seed run is self-verifying.
  const ordersWithRevenue = orders.filter(
    (o) => o.status !== "refunded" && o.status !== "cancelled",
  );
  const totalRevenueCents = ordersWithRevenue.reduce((s, o) => s + o.totalCents, 0);

  console.log("Omakase fixtures written to /fixtures:");
  console.log(`  collections : ${collections.length}`);
  console.log(`  products    : ${products.length}`);
  console.log(`  customers   : ${customers.length}`);
  console.log(`  orders      : ${orders.length}`);
  console.log(
    `  revenue     : $${(totalRevenueCents / 100).toLocaleString("en-US")} (non-refunded)`,
  );
}

main();
