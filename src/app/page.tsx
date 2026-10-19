import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("versaly_session")?.value;

  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      redirect("/dashboard");
    }
  }

  // Not authenticated: direct to login
  redirect("/login");
}
