import * as React from "react";

import { cn } from "@/lib/utils";

export interface OmakaseGlyphProps extends React.SVGProps<SVGSVGElement> {
  /** Pixel size of the square glyph. Defaults to 20. */
  size?: number;
}

/**
 * The Omakase mark — a minimal "leave it to us" gesture:
 * a covered vessel (the chef's selection, served), drawn as a soft lidded
 * bowl with a single confident line of steam. Calm, considered, rounded-soft.
 * Drawn with currentColor so it inherits ink / paper-on-panel in context.
 */
export function OmakaseGlyph({
  size = 20,
  className,
  ...props
}: OmakaseGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* the bowl — a soft, considered vessel */}
      <path d="M4 12.5h16a8 8 0 0 1-16 0Z" />
      {/* the lid — covered, the selection withheld until served */}
      <path d="M3.5 10.5h17" />
      <path d="M12 6.5v4" />
      {/* one line of steam — drawn once */}
      <path d="M9 4.5c-.6.7-.6 1.3 0 2" />
      <path d="M15 4.5c-.6.7-.6 1.3 0 2" />
    </svg>
  );
}

export interface WordmarkProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Show the geometric glyph alongside the wordmark. Default true. */
  showGlyph?: boolean;
  /** Show the "Leave it to us." subline. Default false. */
  showTagline?: boolean;
  /** Pixel size of the glyph. Default 20. */
  glyphSize?: number;
}

/**
 * The OMAKASE wordmark — mark + wide-tracked uppercase wordmark.
 * Inherits currentColor, so place inside text-ink (storefront nav) or
 * text-paper-on-panel (command sidebar) and it adapts. Reusable everywhere.
 */
export function Wordmark({
  showGlyph = true,
  showTagline = false,
  glyphSize = 20,
  className,
  ...props
}: WordmarkProps) {
  return (
    <span
      className={cn("inline-flex select-none items-center gap-2.5", className)}
      {...props}
    >
      {showGlyph && <OmakaseGlyph size={glyphSize} />}
      <span className="inline-flex flex-col leading-none">
        <span className="font-mono text-[15px] font-medium uppercase tracking-[0.28em]">
          Omakase
        </span>
        {showTagline && (
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            Leave it to us.
          </span>
        )}
      </span>
    </span>
  );
}
