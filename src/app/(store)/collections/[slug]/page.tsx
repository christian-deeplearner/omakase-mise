// A collection page: an editorial header (glyph, name, tagline, description)
// followed by the product grid. Server Component reading the data-layer.
// Coming-soon products are shown; archived are filtered out.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getCollections, getProducts } from "@/lib/data-layer";
import { ProductCard } from "@/components/store/product-card";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection — Omakase" };
  return {
    title: `${collection.name} — Omakase`,
    description: collection.tagline,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = getProducts({ collectionSlug: slug }).filter(
    (p) => p.status !== "archived",
  );

  return (
    <div className="bg-paper">
      {/* Header */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-28">
          <Link
            href="/collections"
            className="label label-muted transition-colors hover:text-accent"
          >
            ← All Collections
          </Link>

          <div className="mt-10 flex items-start gap-6 sm:gap-10">
            <span
              aria-hidden
              className="serif text-5xl leading-none text-ink sm:text-7xl"
            >
              {collection.glyph}
            </span>
            <div>
              <h1 className="display text-5xl text-ink sm:text-7xl">
                {collection.name}
              </h1>
              <p className="serif mt-4 text-2xl text-ink-muted sm:text-3xl">
                {collection.tagline}
              </p>
            </div>
          </div>

          <p className="serif mt-10 max-w-2xl text-lg text-ink-muted">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="label label-muted">
            {String(products.length).padStart(2, "0")} pieces
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="serif text-xl text-ink-muted">
            This collection is being prepared. The next drop arrives soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
