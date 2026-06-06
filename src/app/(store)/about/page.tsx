// The About page — a two-column manifesto for the (fictional) house, in the
// Omakase voice: calm, considered, anti-hype. Server Component; static content.

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 sm:px-10 sm:pt-32">
        <p className="label label-muted">About</p>
        <h1 className="display mt-6 max-w-4xl text-5xl text-ink sm:text-7xl">
          Curated essentials, chosen for you.
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="label label-muted">The Premise</h2>
          </div>
          <div className="md:col-span-8 space-y-8">
            <p className="serif text-2xl text-ink sm:text-3xl">
              Omakase is a Japanese luxury house of fictional goods — a teaching
              artifact, not a store you can buy from.
            </p>
            <p className="serif text-lg text-ink-muted">
              Every collection, product, price, and order here is invented and
              seeded with synthetic data. The point is the craft of the build:
              how a calm, premium storefront and the operator command center
              behind it come together cleanly, with a single data seam between
              the showroom and the back office.
            </p>
            <p className="serif text-lg text-ink-muted">
              The name says it plainly — omakase, お任せ: leave it to us. We edit
              six collections down to the few pieces worth keeping, and you wear
              them for years. Nothing extra.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-hairline pt-20 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="label label-muted">Materials &amp; Method</h2>
          </div>
          <div className="md:col-span-8 grid gap-10 sm:grid-cols-2">
            <p className="serif text-lg text-ink-muted">
              Unbleached naturals and warm cypress tones for the foundation
              lines. Indigo dyed deep, clean whites, dark essentials drawn in
              one line. Kuro is the limited drop — numbered, in small runs.
            </p>
            <p className="serif text-lg text-ink-muted">
              The craft is real even when the catalog is a story. That is the
              register we are after: restraint, fine hairlines, generous space,
              and the patience to keep only what lasts.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <Link
            href="/collections"
            className="label inline-flex items-center gap-2 border-b border-hairline pb-2 text-ink transition-colors hover:border-ink hover:text-accent"
          >
            See the collections
          </Link>
        </div>
      </section>
    </div>
  );
}
