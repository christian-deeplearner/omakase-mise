import { test, expect } from "@playwright/test";
import { login } from "./fixtures/auth";

// Command-center overview: behind the auth gate, the KPI cards and the
// conversion-funnel chart must render against the live in-memory world.

test("overview renders KPI cards and the funnel chart", async ({ page }) => {
  await login(page);

  // KPI grid + each of the six metric cards (MetricCard forwards data-testid).
  const grid = page.getByTestId("kpi-grid");
  await expect(grid).toBeVisible();

  for (const id of [
    "kpi-orders-today",
    "kpi-revenue-7d",
    "kpi-revenue-30d",
    "kpi-conversion",
    "kpi-abandonment",
    "kpi-aov",
  ]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }

  // Revenue cards show a formatted currency value, not an empty/skeleton card.
  await expect(page.getByTestId("kpi-revenue-7d")).toContainText("$");

  // The funnel chart renders with its labeled stages.
  const funnel = page.getByTestId("overview-funnel");
  await expect(funnel).toBeVisible();
  await expect(funnel).toContainText("Conversion Funnel");
  // computeFunnel always produces stages; assert at least one stage bar drew.
  await expect(funnel.locator(".bg-accent").first()).toBeVisible();
});
