import { randomInt } from "node:crypto";
import { validatePassword } from "@/lib/access";

// No look-alike characters (0/O, 1/l/I) so it can be read out or typed from a message
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A random one-time password for a new team member. They must replace it on first sign-in. */
export function generateTempPassword(length = 16): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    let pw = "";
    for (let i = 0; i < length; i++) pw += ALPHABET[randomInt(ALPHABET.length)];
    if (validatePassword(pw) === null) return pw;
  }
  throw new Error("Could not generate a password");
}
