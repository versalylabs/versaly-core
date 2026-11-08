import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

/**
 * Session token primitives shared by the request proxy and server routes.
 * Deliberately free of `next/headers` and Prisma so it can run anywhere.
 */

export const SESSION_COOKIE_NAME = "versaly_session";
export const SESSION_DURATION_DAYS = 7;

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  /** True until a new team member sets their own password. */
  mcp?: boolean;
}

// Only used for local development. Production refuses to run without a real secret.
const DEV_ONLY_SECRET = "versaly-core-local-development-secret-not-for-production";

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is missing or shorter than 32 characters. Set it in the deployment environment."
      );
    }
    return new TextEncoder().encode(DEV_ONLY_SECRET);
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as UserRole,
      name: payload.name as string,
      mcp: payload.mcp === true,
    };
  } catch {
    return null;
  }
}
