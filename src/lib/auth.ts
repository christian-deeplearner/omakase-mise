// ─────────────────────────────────────────────────────────────────────────
// Mock auth for the Omakase command center.
//
// This is a DEMO gate, not real account security: a single shared password
// ("omakase") opens a signed, httpOnly session cookie so the operator surfaces
// aren't world-readable in a public repo. The session is a JWT signed with
// `jose` (HS256). The teaching point is the seam — verifySession() is the one
// call the command-center layout makes; swap the secret/issuer or point it at
// a real IdP later without touching any page.
// ─────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/** Name of the httpOnly session cookie the command center reads. */
export const SESSION_COOKIE = "omakase_session";

/** The single demo password. Any email + this password authenticates. */
export const DEMO_PASSWORD = "omakase";

/** How long a session is valid. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// In a real app this is a long random secret from the environment. For a
// public demo we fall back to a fixed dev secret so the harness "just runs".
const SECRET = new TextEncoder().encode(
  process.env.OMAKASE_SESSION_SECRET ?? "omakase-demo-session-secret-not-for-production",
);

const ISSUER = "omakase-command";
const AUDIENCE = "omakase-operator";

export interface SessionPayload extends JWTPayload {
  /** The operator's email (informational only — any email is accepted). */
  email: string;
  /** Display name derived from the email local-part. */
  name: string;
}

/** Sign a session JWT for the given operator. Returns the compact token. */
export async function signSession(
  payload: Pick<SessionPayload, "email" | "name">,
): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(SECRET);
}

/**
 * Verify a session token. Returns the decoded payload, or null if the token
 * is missing, malformed, expired, or fails signature/claim verification.
 */
export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/** Max-age (seconds) callers should use when setting the session cookie. */
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Derive a friendly display name from an email local-part. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "operator";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Operator";
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
