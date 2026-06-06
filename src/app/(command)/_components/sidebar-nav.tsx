"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListOrdered,
  Package,
  Users,
  LineChart,
  Sparkles,
  Bot,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/studio", label: "Studio", icon: Sparkles },
  { href: "/agents", label: "Agents", icon: Bot },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Command center">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
              active
                ? "bg-panel-2 text-paper-on-panel"
                : "text-paper-on-panel/55 hover:bg-panel-2/60 hover:text-paper-on-panel",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
