import { redirect } from "next/navigation";

// Signed-out visitors are sent to /login by the request proxy before reaching here.
export default function RootPage() {
  redirect("/dashboard");
}
