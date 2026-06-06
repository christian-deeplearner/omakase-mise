// Editorial product card for the collection grid. Tall image, serif name,
// mono price. Server-safe. Plain <img> per house convention (no next/image).

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images[0];
  const comingSoon = product.status === "coming-soon";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      data-testid={`product-card-${product.slug}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-card">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="serif text-4xl text-ink-muted">Omakase</span>
          </div>
        )}

        {comingSoon && (
          <span className="label absolute left-3 top-3 bg-panel px-2 py-1 text-paper-on-panel">
            Coming Soon
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="serif text-lg leading-tight text-ink transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <span className="label label-muted shrink-0">
          {formatCurrency(product.priceCents, product.currency)}
        </span>
      </div>
    </Link>
  );
}
