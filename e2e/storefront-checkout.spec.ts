import { test, expect, type Page } from "@playwright/test";
import { login } from "./fixtures/auth";
import type { Product } from "../src/lib/types";

// THE FULL-LOOP TEST — Mission 2's payoff.
//
// Storefront: home → collection → PDP → size → Add to Cart → cart → checkout →
// order confirmation (assert an order number). Then cross the seam into the
// command center: log in → /orders → assert the just-placed order appears.
//
// Both halves share ONE in-memory world because Playwright owns a single dev
// server (see playwright.config.ts + src/lib/data-layer/fake/store.ts). The
// order created by checkout() is visible to the operator's Orders list in the
// same process.

/** Pick a deterministic buyable product (active + in stock) via the store API. */
async function pickBuyableProduct(page: Page): Promise<Product> {
  const res = await page.request.get("/api/store/products?status=active");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { products: Product[] };
  const buyable = body.products.find((p) => p.inventory > 0);
  expect(
    buyable,
    "seed must contain at least one active, in-stock product",
  ).toBeTruthy();
  return buyable!;
}

test("full storefront loop: browse → PDP → cart → checkout → confirmation → command center", async ({
  page,
}) => {
  // ── Home renders the editorial showpiece ──────────────────────────────────
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Chosen for you/i }),
  ).toBeVisible();

  // ── Prove the collection navigation works from the home rows ───────────────
  const product = await pickBuyableProduct(page);
  await page.getByTestId(`collection-row-${product.collectionSlug}`).click();
  await page.waitForURL(`**/collections/${product.collectionSlug}`);
  await expect(
    page.getByRole("heading", { level: 1 }).first(),
  ).toBeVisible();

  // ── Open the chosen product's PDP ──────────────────────────────────────────
  // Navigate by slug so the test is robust regardless of which collection the
  // buyable product lives in; this is still a real PDP render + real add-to-cart.
  await page.goto(`/product/${product.slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: product.name }),
  ).toBeVisible();
  await expect(page.getByTestId("product-price")).toBeVisible();

  // ── Select a size (apparel shows a size <Select>; one-size objects don't) ──
  const sizeSelect = page.getByTestId("size-select");
  if ((await sizeSelect.count()) > 0) {
    await sizeSelect.click();
    // Radix Select renders options in a portal as listbox options.
    await page.getByRole("option").first().click();
  }

  // ── Add to Cart ────────────────────────────────────────────────────────────
  const addToCart = page.getByTestId("add-to-cart");
  await expect(addToCart).toBeEnabled();
  await addToCart.click();
  await expect(page.getByTestId("added-confirmation")).toBeVisible();

  // Nav badge reflects the line.
  await expect(page.getByTestId("nav-cart")).toContainText("(1)");

  // ── Cart ───────────────────────────────────────────────────────────────────
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-count")).toContainText("1 items");
  await expect(page.getByTestId("cart-subtotal")).toBeVisible();

  // ── Checkout ─────────────────────────────────────────────────────────────--
  await page.getByTestId("cart-checkout").click();
  await page.waitForURL("**/checkout");

  const buyerEmail = `qa.buyer.${Date.now()}@omakase.test`;
  const buyerName = "QA Buyer";
  await page.getByTestId("checkout-email").fill(buyerEmail);
  await page.getByTestId("checkout-name").fill(buyerName);
  await page.locator("#address").fill("1 Dawn Lane");
  await page.locator("#city").fill("Lighthaven");
  await page.locator("#postalCode").fill("00001");
  await page.locator("#country").fill("Auroria");

  await page.getByTestId("checkout-submit").click();

  // ── Order confirmation — assert the order number ───────────────────────────
  await page.waitForURL("**/order-confirmation/**");
  const orderNumberEl = page.getByTestId("order-number");
  await expect(orderNumberEl).toBeVisible();
  const orderNumber = (await orderNumberEl.textContent())?.trim() ?? "";
  expect(orderNumber, "confirmation must show an order number").toMatch(
    /^OMK-\d+$/,
  );
  await expect(page.getByTestId("confirmation-line")).toHaveCount(1);

  // ── Cross the seam: the new order appears in the command center ────────────
  await login(page);
  await page.goto("/orders");
  await expect(page.getByTestId("orders-table")).toBeVisible();

  // The order list polls/loads via React Query; wait for the freshly-placed
  // order's number to surface (it's unshifted to the front, newest-first).
  const newOrderLink = page
    .getByTestId("orders-row-link")
    .filter({ hasText: orderNumber });
  await expect(newOrderLink).toBeVisible({ timeout: 15_000 });

  // And it carries the buyer we checked out as.
  const newOrderRow = page
    .getByTestId("orders-row")
    .filter({ hasText: orderNumber });
  await expect(newOrderRow).toContainText(buyerEmail);
});
