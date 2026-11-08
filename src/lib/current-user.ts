"use client";

import { useSyncExternalStore } from "react";
import type { Permission } from "@/lib/rbac";
import { canViewPage } from "@/lib/access";

/**
 * Who is signed in and what they may do, as reported by the server. Used to
 * tailor the interface (hide what a role can't use) and to hold back
 * automation a role isn't permitted to run. The server enforces every rule
 * again on each request, so this is for convenience, not security.
 */

export type Role = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "READ_ONLY";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

let current: CurrentUser | null = null;
let inflight: Promise<CurrentUser | null> | null = null;
const listeners = new Set<() => void>();

function set(user: CurrentUser | null) {
  current = user;
  listeners.forEach((l) => l());
}

export async function loadCurrentUser(force = false): Promise<CurrentUser | null> {
  if (current && !force) return current;
  if (inflight && !force) return inflight;
  inflight = fetch("/api/auth/me", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const user = json?.data?.user;
      if (!user) return null;
      const me: CurrentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: json.data.permissions ?? [],
      };
      set(me);
      return me;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function getCachedUser(): CurrentUser | null {
  return current;
}

/** True if the signed-in person has this permission. False until they are known. */
export function userCan(permission: Permission): boolean {
  return Boolean(current?.permissions.includes(permission));
}

export function userCanViewPage(pathname: string): boolean {
  // Until we know who is signed in, show everything; the server decides what is real
  return current ? canViewPage(current.role, pathname) : true;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** React hook: the signed-in user, or null while it loads. */
export function useCurrentUser(): CurrentUser | null {
  const user = useSyncExternalStore(subscribe, () => current, () => null);
  if (!user && typeof window !== "undefined" && !inflight) void loadCurrentUser();
  return user;
}
