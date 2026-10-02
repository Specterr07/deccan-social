import { AppHeader } from "@/components/layout/AppHeader";

// Shell shared by every signed-in screen (Months, Library, review pages…).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
