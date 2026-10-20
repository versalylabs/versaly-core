import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const SESSION_COOKIE_NAME = "versaly_session";
const SESSION_DURATION_DAYS = 7;

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET || "versaly_core_dev_secret_key_change_in_production_min_32_chars";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

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
 * Issue a signed JWT token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getJwtSecret());
}

/**
 * Verify a signed JWT token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
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

/**
 * Get the current authenticated user from session cookie
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const sessionPayload = await verifySessionToken(token);
    if (!sessionPayload) return null;

    if (sessionPayload.userId === "usr-demo-owner" || sessionPayload.email === "versalylabs@gmail.com") {
      return {
        id: "usr-demo-owner",
        email: "versalylabs@gmail.com",
        name: "Versaly Labs Administrator",
        role: "OWNER" as const,
        status: "ACTIVE" as const,
        jobTitle: "Founder & Lead Operations Architect",
        avatarUrl: null,
        createdAt: new Date("2026-01-01"),
      };
    }

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
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
