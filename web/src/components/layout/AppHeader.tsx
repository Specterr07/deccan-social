import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";

// Top bar for every signed-in screen: wordmark, main navigation and sign out.
export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-8">
        <Link href="/months" aria-label="Deccan Produce, go to Months">
          {/* An SVG logo needs no resizing, so a plain image is fine here. */}
          <Image src="/brand/logos/wordmark-color.svg" alt="Deccan Produce" width={140} height={18} priority />
        </Link>
        <nav aria-label="Main" className="flex flex-1 items-center gap-1">
          <NavLink href="/months">Months</NavLink>
          <NavLink href="/library">Library</NavLink>
        </nav>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
