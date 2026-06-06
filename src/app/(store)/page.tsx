// The editorial home — the showpiece. Omakase tokens (Sand + Clay): a full-bleed
// dark hero melting into paper with a calm display statement; THE COLLECTIONS as
// hairline-separated rows; a two-column POSITION manifesto; the JOIN THE LIST
// footer (in the layout). Server Component — reads the data-layer directly.

import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { getCollections, getProducts } from "@/lib/data-layer";
import { CollectionRow } from "@/components/store/collection-row";
import { ProductCard } from "@/components/store/product-card";

export default function StoreHome() {
  const collections = getCollections();
  const featured = getProducts({ status: "active" }).slice(0, 3);

  return (
    <div className="bg-paper">
      {/* ── Hero: dark panel melting into paper ───────────────────────── */}
      <section className="relative isolate overflow-hidden bg-panel text-paper-on-panel">
        {/* full-bleed image, dimmed, melting to paper at the base.
            Served from public/images/hero.jpg (creative pipeline →
            scripts/generate-images.mjs). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-panel/40 via-panel/60 to-paper"
        />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 sm:px-10 sm:pb-28">
          <p className="label text-paper-on-panel/70">
            Omakase · お任せ
          </p>
          <h1 className="display mt-8 max-w-5xl text-5xl text-paper-on-panel sm:text-7xl md:text-8xl">
            Chosen for you.
            <br />
            Made to keep.
          </h1>
          <p className="serif mt-8 max-w-xl text-xl text-paper-on-panel/80">
            Six collections of curated essentials. Considered, calm, and built
            to last. Leave it to us.
          </p>
          <div className="mt-10">
            <Link
              href="/collections"
              className="label group inline-flex items-center gap-2 border-b border-paper-on-panel/40 pb-2 text-paper-on-panel transition-colors hover:border-paper-on-panel"
            >
              See the collections
              <ArrowDownRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE COLLECTIONS — hairline-separated rows ─────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-32">
        <div className="flex items-end justify-between px-0 sm:px-10">
          <h2 className="label label-muted">The Collections</h2>
          <span className="label label-muted">
            {String(collections.length).padStart(2, "0")} on the menu
          </span>
        </div>
      </section>
      <section className="mx-auto mt-10 max-w-7xl border-b border-hairline sm:px-10">
        {collections.map((collection, i) => (
          <CollectionRow
            key={collection.slug}
            collection={collection}
            index={i + 1}
          />
        ))}
      </section>

      {/* ── POSITION — two-column manifesto ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28 sm:px-10 sm:py-36">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="label label-muted">Position</h2>
          </div>
          <div className="md:col-span-8">
            <p className="display text-3xl text-ink sm:text-4xl md:text-5xl">
              We choose the pieces. You wear them for years. Nothing extra —
              only what holds up.
            </p>
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <p className="serif text-lg text-ink-muted">
                Curated essentials, chosen for you. Six collections, each with
                its own character, edited down to the few pieces worth keeping.
                Leave it to us.
              </p>
              <p className="serif text-lg text-ink-muted">
                Everything here is fictional — a teaching house, seeded with
                invented goods. The craft is real; the catalog is a story we
                tell to show how a calm, premium store is built.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── A glimpse of the catalog ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-10 sm:pb-36">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="label label-muted">Recently In</h2>
            <Link
              href="/collections"
              className="label text-ink transition-colors hover:text-accent"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
