import bcrypt from "bcryptjs";

/**
 * Owner account configured through environment variables, so the founder can
 * sign in before (and independently of) the user database.
 *
 *   OWNER_EMAIL          the owner's login email
 *   OWNER_PASSWORD_HASH  base64-encoded bcrypt hash (generate with `npm run owner:password`)
 *   OWNER_NAME           optional display name
 *
 * The hash is base64-encoded because raw bcrypt hashes contain `$`, which
 * .env loaders try to expand as variables.
 */

export const OWNER_USER_ID = "env-owner";

export function getOwnerEmail(): string | null {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return email ? email : null;
}

function getOwnerPasswordHash(): string | null {
  const encoded = process.env.OWNER_PASSWORD_HASH?.trim();
  if (!encoded) return null;
  try {
    const hash = Buffer.from(encoded, "base64").toString("utf8");
    return hash.startsWith("$2") ? hash : null;
  } catch {
    return null;
  }
}

export function getOwnerProfile() {
  const email = getOwnerEmail();
  if (!email) return null;
  return {
    id: OWNER_USER_ID,
    email,
    name: process.env.OWNER_NAME?.trim() || "Versaly Owner",
    role: "OWNER" as const,
    status: "ACTIVE" as const,
    jobTitle: "Founder",
    avatarUrl: null,
    createdAt: new Date(0),
  };
}

/** True only when the email matches OWNER_EMAIL and the password matches its hash. */
export async function verifyOwnerCredentials(email: string, password: string): Promise<boolean> {
  const ownerEmail = getOwnerEmail();
  const hash = getOwnerPasswordHash();
  if (!ownerEmail || !hash || email !== ownerEmail) return false;
  return bcrypt.compare(password, hash);
}
