import { test, expect } from "@playwright/test";
import { login } from "./fixtures/auth";

// Command-center Orders: the status filter (a Radix Select) must re-query the
// orders API and update the table. We compare the "All statuses" count against
// a filtered count and assert every visible row matches the chosen status.

test("orders status filter re-queries and updates the table", async ({
  page,
}) => {
  await login(page);
  await page.goto("/orders");

  const table = page.getByTestId("orders-table");
  const countLabel = page.getByTestId("orders-count");

  // Baseline: all orders loaded (seed has 300 → count is non-trivial).
  await expect(table).toBeVisible();
  await expect(countLabel).not.toContainText("Loading", { timeout: 15_000 });
  const allCountText = (await countLabel.textContent())?.trim() ?? "";
  const allCount = Number.parseInt(allCountText.replace(/[^\d]/g, ""), 10);
  expect(allCount).toBeGreaterThan(0);
  await expect(page.getByTestId("orders-row").first()).toBeVisible();

  // Open the status filter and choose "Delivered" (the dominant seeded status,
  // so a non-empty result is guaranteed).
  await page.getByTestId("orders-status-filter").click();
  await page.getByTestId("orders-status-option-delivered").click();

  // The table re-queries; wait for the count to settle to the filtered value.
  await expect(countLabel).not.toContainText("Loading", { timeout: 15_000 });
  await expect(page.getByTestId("orders-row").first()).toBeVisible();

  const deliveredCountText = (await countLabel.textContent())?.trim() ?? "";
  const deliveredCount = Number.parseInt(
    deliveredCountText.replace(/[^\d]/g, ""),
    10,
  );
  expect(deliveredCount).toBeGreaterThan(0);
  // Filtering to one status must be a strict subset of all orders.
  expect(deliveredCount).toBeLessThan(allCount);

  // Every visible row's Status cell reads "delivered" (the badge displays it
  // uppercased via CSS, but the DOM text node is the lowercase status string).
  const statusBadges = page
    .getByTestId("orders-row")
    .getByText(/^delivered$/i);
  await expect(statusBadges.first()).toBeVisible();
  const rowCount = await page.getByTestId("orders-row").count();
  await expect(statusBadges).toHaveCount(rowCount);
});
