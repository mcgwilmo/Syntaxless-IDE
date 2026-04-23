import { redirect } from "next/navigation";

export default function ClosedPreAlphaRedirectPage() {
  redirect("/login");
}
