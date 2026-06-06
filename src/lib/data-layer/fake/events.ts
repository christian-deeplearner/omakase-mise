// ~5000 StoreEvents over the last 30 days, modeled as SESSIONS that walk a
// funnel: page_view → product_view → add_to_cart → checkout_start → purchase
// (with searches sprinkled in). Modeling whole sessions — rather than emitting
// independent random events — is what makes the funnel + conversion numbers in
// the command center look like a real store instead of noise.

import type { Customer, Product, StoreEvent, StoreEventType } from "@/lib/types";
import { faker, makeId, isoDaysAgo, weightedPick } from "./seed";

const TARGET_EVENTS = 5000;
const EVENT_WINDOW_DAYS = 30;

const DEVICES = ["desktop", "mobile", "tablet"] as const;
const DEVICE_WEIGHTS = [46, 44, 10];

// Probability a session advances from each stage to the next. These drop-off
// rates produce a believable e-commerce funnel.
const ADVANCE = {
  toProductView: 0.62, // of sessions that did a page_view
  toAddToCart: 0.34, // of sessions that viewed a product
  toCheckout: 0.55, // of sessions that added to cart
  toPurchase: 0.62, // of sessions that started checkout
} as const;

function buildEvents(products: Product[], customers: Customer[]): StoreEvent[] {
  const sellable = products.filter((p) => p.status !== "archived");
  const events: StoreEvent[] = [];

  // Generate sessions until we hit the target event count.
  while (events.length < TARGET_EVENTS) {
    const sessionId = makeId("ses", 12);
    const device = weightedPick(DEVICES, DEVICE_WEIGHTS);

    // ~60% of sessions are tied to a known customer; the rest are anonymous.
    const customer = faker.datatype.boolean({ probability: 0.6 })
      ? faker.helpers.arrayElement(customers)
      : null;
    const customerId = customer?.id ?? null;

    const dayAgo = faker.number.int({ min: 0, max: EVENT_WINDOW_DAYS });
    // All events in a session share a day; ts ordering comes from isoDaysAgo's
    // random time-of-day, then we sort the whole log at the end.
    const ts = () => isoDaysAgo(dayAgo);

    const push = (type: StoreEventType, productId: string | null) => {
      events.push({
        id: makeId("evt", 10),
        type,
        customerId,
        productId,
        sessionId,
        ts: ts(),
        device,
      });
    };

    // Every session starts with at least one page_view; some browse a few pages.
    const pageViews = weightedPick([1, 2, 3], [55, 30, 15]);
    for (let i = 0; i < pageViews; i++) push("page_view", null);

    // ~30% of sessions run a search.
    if (faker.datatype.boolean({ probability: 0.3 })) push("search", null);

    if (faker.datatype.boolean({ probability: ADVANCE.toProductView })) {
      const viewed = faker.helpers.arrayElements(
        sellable,
        weightedPick([1, 2, 3], [50, 32, 18]),
      );
      for (const p of viewed) push("product_view", p.id);

      // The product they engage with for the rest of the funnel.
      const focus = faker.helpers.arrayElement(viewed);

      if (faker.datatype.boolean({ probability: ADVANCE.toAddToCart })) {
        push("add_to_cart", focus.id);

        if (faker.datatype.boolean({ probability: ADVANCE.toCheckout })) {
          push("checkout_start", focus.id);

          if (faker.datatype.boolean({ probability: ADVANCE.toPurchase })) {
            push("purchase", focus.id);
          }
        }
      }
    }
  }

  // Global chronological sort so any "recent activity" slice is coherent.
  events.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  return events;
}

export function getEventsSeed(products: Product[], customers: Customer[]): StoreEvent[] {
  return buildEvents(products, customers);
}
