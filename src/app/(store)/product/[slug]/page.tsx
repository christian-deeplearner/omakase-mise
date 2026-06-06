// The PDP: large imagery on the left, serif name + price + size select +
// Add to Cart on the right, with the description and collection context below.
// Server Component; the only client island is <AddToCartButton>.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCollection,
  getProduct,
  getProducts,
} from "@/lib/data-layer";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product — Omakase" };
  return {
    title: `${product.name} — Omakase`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const collection = getCollection(product.collectionSlug);
  const inStock = product.status === "active" && product.inventory > 0;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <nav className="label label-muted flex items-center gap-2">
          <Link href="/collections" className="hover:text-accent">
            Collections
          </Link>
          {collection && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/collections/${collection.slug}`}
                className="hover:text-accent"
              >
                {collection.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Imagery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-card">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="serif text-5xl text-ink-muted">Omakase</span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {product.images.slice(1).map((src, i) => (
                  <div
                    key={src}
                    className="aspect-[3/4] overflow-hidden bg-card"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} — view ${i + 2}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {collection && (
              <Link
                href={`/collections/${collection.slug}`}
                className="label label-muted inline-flex items-center gap-2 transition-colors hover:text-accent"
              >
                <span aria-hidden className="serif text-base text-ink">
                  {collection.glyph}
                </span>
                {collection.name}
              </Link>
            )}

            <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">
              {product.name}
            </h1>

            <p className="serif mt-5 text-2xl text-ink" data-testid="product-price">
              {formatCurrency(product.priceCents, product.currency)}
            </p>

            <p className="serif mt-8 max-w-prose text-lg text-ink-muted">
              {product.description}
            </p>

            <div className="mt-10 border-t border-hairline pt-10">
              <AddToCartButton product={product} />
            </div>

            <dl className="mt-10 space-y-3 border-t border-hairline pt-8">
              <div className="flex items-center justify-between">
                <dt className="label label-muted">Availability</dt>
                <dd className="label text-ink">
                  {inStock
                    ? "In stock"
                    : product.status === "coming-soon"
                      ? "Coming soon"
                      : "Sold out"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="label label-muted">Sizes</dt>
                <dd className="label text-ink">{product.sizes.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
