import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Editorial page header for command-center surfaces: a small mono eyebrow,
 * an oversized serif title, and an optional right-aligned action slot.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        {eyebrow && <span className="label label-muted">{eyebrow}</span>}
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {description && (
          <p className="serif max-w-xl text-lg text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
