import { timingSafeEqual } from "node:crypto";

/**
 * The M-Pesa callback URLs are public, so they carry a secret token in the path.
 * The token must be set in MPESA_CALLBACK_SECRET (at least 16 characters); if it
 * isn't, every callback is refused.
 */
export function secretMatches(provided: string): boolean {
  const expected = process.env.MPESA_CALLBACK_SECRET;
  if (!expected || expected.length < 16) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
