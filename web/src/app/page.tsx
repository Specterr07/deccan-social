import { redirect } from "next/navigation";

// The home page just forwards to the list of months (the proxy sends logged-out visitors to /login first).
export default function HomePage() {
  redirect("/months");
}
