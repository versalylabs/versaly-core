import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getOwnerProfile, OWNER_USER_ID } from "@/lib/owner";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_DAYS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export { createSessionToken, verifySessionToken, type SessionPayload };

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Set the authentication session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

/**
 * Clear the authentication session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Database unavailable", { cause });
    this.name = "DatabaseUnavailableError";
  }
}

/**
 * Get the current authenticated user from session cookie.
 * Returns null when signed out; throws DatabaseUnavailableError if the user
 * can't be looked up (so callers can answer 503 instead of "signed out").
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const sessionPayload = await verifySessionToken(token);
  if (!sessionPayload) return null;

  // Environment-configured owner account (no database row)
  if (sessionPayload.userId === OWNER_USER_ID) {
    const owner = getOwnerProfile();
    if (!owner || owner.email !== sessionPayload.email) return null;
    return owner;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: sessionPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        jobTitle: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch (error) {
    throw new DatabaseUnavailableError(error);
  }
}
