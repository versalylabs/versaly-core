import { redirect } from "next/navigation";

// The request proxy normally redirects "/" before this renders
// (signed in → /dashboard, signed out → /login). This is the fallback.
export const instant = false;

export default function RootPage() {
  redirect("/dashboard");
}
