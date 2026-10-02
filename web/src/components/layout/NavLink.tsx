"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// A navigation link that is highlighted (and announced) when its section is the current page.
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        isCurrent && "bg-accent text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
