import { expect, type Page } from "@playwright/test";

// Shared login helper for the operator command center.
//
// The gate is a mock JWT session cookie (src/lib/auth.ts): any well-formed
// email + the demo password authenticates. We drive the real /login form so the
// test exercises the same path an operator would, then wait for the gated
// /overview to render rather than racing the client-side redirect.

export const DEMO_PASSWORD = "omakase";
export const DEFAULT_OPERATOR_EMAIL = "operator@omakase.studio";

/**
 * Authenticate via the login form and land on the command center.
 * Resolves once /overview is loaded (cookie is set, gate passed).
 */
export async function login(
  page: Page,
  email: string = DEFAULT_OPERATOR_EMAIL,
  password: string = DEMO_PASSWORD,
): Promise<void> {
  await page.goto("/login");

  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();

  // The login page does router.replace("/overview"); wait for the gated page.
  await page.waitForURL("**/overview", { timeout: 15_000 });
  await expect(page.getByTestId("kpi-grid")).toBeVisible();
}
