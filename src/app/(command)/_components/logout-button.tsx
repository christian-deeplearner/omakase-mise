"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      data-testid="logout-button"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-paper-on-panel/55 transition-colors hover:text-paper-on-panel disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="size-3.5" strokeWidth={1.5} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
