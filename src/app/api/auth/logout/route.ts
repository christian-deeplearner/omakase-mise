import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth";

/**
 * POST /api/auth/logout — clears the session cookie. Returns { ok: true }.
 * The client redirects to /login after a successful call.
 */
export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
