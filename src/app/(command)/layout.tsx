import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Wordmark } from "@/components/brand/wordmark";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { SidebarNav } from "./_components/sidebar-nav";
import { LogoutButton } from "./_components/logout-button";

// The command center reflects live in-memory state; never cache it.
export const dynamic = "force-dynamic";

export default async function CommandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── The gate ──────────────────────────────────────────────────────────────
  // Read the signed session cookie on the server. No session → /login.
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between bg-panel text-paper-on-panel md:flex">
        <div>
          <div className="flex h-16 flex-col justify-center gap-1 border-b border-paper-on-panel/10 px-5">
            <Wordmark glyphSize={20} className="text-paper-on-panel" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper-on-panel/45">
              Operator
            </span>
          </div>
          <div className="px-3 py-5">
            <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-paper-on-panel/40">
              Console
            </p>
            <SidebarNav />
          </div>
        </div>

        <div className="border-t border-paper-on-panel/10 px-5 py-5">
          <p className="truncate font-mono text-[11px] text-paper-on-panel">
            {session.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-paper-on-panel/45">
            {session.email}
          </p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-paper/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            {/* Wordmark shown on mobile where the sidebar is hidden */}
            <Wordmark glyphSize={18} className="text-ink md:hidden" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted md:inline">
              Omakase · Operator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
              <span
                className="size-1.5 rounded-full bg-positive"
                aria-hidden="true"
              />
              Live · fake data
            </span>
          </div>
        </header>

        {/* Mobile nav strip */}
        <div className="border-b border-hairline bg-panel md:hidden">
          <div className="px-2 py-2">
            <SidebarNav />
          </div>
        </div>

        <main className="flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
