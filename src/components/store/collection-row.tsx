// A single editorial collection row, GAOCHAO-style:
// [glyph] [name] [mono label] [serif tagline] [arrow] — the whole row links to
// the collection. Rows are separated by full-width hairlines by the parent.
// Server-safe (no client hooks): rendered on the home + collections index.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/lib/types";

export function CollectionRow({
  collection,
  index,
}: {
  collection: Collection;
  /** 1-based ordinal shown as the mono label (e.g. "01"). */
  index: number;
}) {
  const ordinal = String(index).padStart(2, "0");

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block border-t border-hairline transition-colors hover:bg-card"
      data-testid={`collection-row-${collection.slug}`}
    >
      <div className="flex items-center gap-5 px-6 py-7 sm:gap-8 sm:px-10 sm:py-9">
        {/* glyph mark */}
        <span
          aria-hidden
          className="serif w-8 shrink-0 text-3xl leading-none text-ink sm:w-10 sm:text-4xl"
        >
          {collection.glyph}
        </span>

        {/* name */}
        <span className="display w-[7.5rem] shrink-0 text-2xl text-ink sm:w-56 sm:text-4xl">
          {collection.name}
        </span>

        {/* mono ordinal label */}
        <span className="label label-muted hidden w-16 shrink-0 sm:inline-block">
          {ordinal}
        </span>

        {/* serif tagline — flexes to fill */}
        <span className="serif hidden flex-1 text-lg text-ink-muted md:block">
          {collection.tagline}
        </span>

        {/* arrow */}
        <span className="ml-auto inline-flex shrink-0 items-center justify-center text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
          <ArrowUpRight className="size-5 sm:size-6" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
