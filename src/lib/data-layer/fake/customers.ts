// ~120 customers. We generate the identity here (name/email/location/createdAt)
// and seed plausible ordersCount/ltv/lastOrderAt. orders.ts later RECONCILES
// these aggregates against the real generated orders so the storefront and the
// command center never disagree about a customer's lifetime value.

import type { Customer } from "@/lib/types";
import { faker, makeId, isoDaysAgo } from "./seed";

const CUSTOMER_COUNT = 120;

// A curated set of "Omakase customer" cities — feels like an international
// curated base rather than random faker noise.
const CITIES = [
  "Brooklyn, NY",
  "Los Angeles, CA",
  "Austin, TX",
  "Portland, OR",
  "Chicago, IL",
  "San Francisco, CA",
  "Seattle, WA",
  "Denver, CO",
  "London, UK",
  "Paris, FR",
  "Berlin, DE",
  "Copenhagen, DK",
  "Stockholm, SE",
  "Amsterdam, NL",
  "Lisbon, PT",
  "Tokyo, JP",
  "Seoul, KR",
  "Melbourne, AU",
  "Toronto, CA",
  "Mexico City, MX",
] as const;

function buildCustomers(): Customer[] {
  return Array.from({ length: CUSTOMER_COUNT }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet
      .email({ firstName, lastName, provider: "omakase-demo.test" })
      .toLowerCase();

    // Acquired sometime in the last ~2 years.
    const createdDaysAgo = faker.number.int({ min: 30, max: 720 });
    const createdAt = isoDaysAgo(createdDaysAgo);

    // Seed aggregates. These are PLACEHOLDERS — orders.ts overwrites them for
    // customers who actually have orders in the generated window.
    const ordersCount = faker.number.int({ min: 0, max: 9 });
    const ltvCents =
      ordersCount === 0
        ? 0
        : faker.number.int({ min: 9000, max: 9000 + ordersCount * 24000 });
    const lastOrderAt =
      ordersCount === 0
        ? null
        : isoDaysAgo(faker.number.int({ min: 0, max: Math.min(createdDaysAgo, 120) }));

    return {
      id: makeId("cus"),
      name,
      email,
      location: faker.helpers.arrayElement(CITIES),
      createdAt,
      ordersCount,
      ltvCents,
      lastOrderAt,
    } satisfies Customer;
  });
}

export function getCustomersSeed(): Customer[] {
  return buildCustomers();
}
