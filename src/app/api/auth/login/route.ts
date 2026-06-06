import { cookies } from "next/headers";

import {
  DEMO_PASSWORD,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  nameFromEmail,
  signSession,
} from "@/lib/auth";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/login
 * Body: { email, password }. Any well-formed email + the demo password
 * ("omakase") authenticates and sets the httpOnly session cookie.
 */
export async function POST(request: Request): Promise<Response> {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password !== DEMO_PASSWORD) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  const name = nameFromEmail(email);
  const token = await signSession({ email, name });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json({ ok: true, email, name });
}
