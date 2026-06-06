"use client";

// The cart. Reads the client cart store, lets you change quantities or remove
// lines, and routes to checkout. Client Component (the cart lives in the
// browser).

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, remove, ready } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex items-end justify-between border-b border-hairline pb-8">
        <h1 className="display text-4xl text-ink sm:text-6xl">Cart</h1>
        <span className="label label-muted" data-testid="cart-count">
          {ready ? items.reduce((n, l) => n + l.quantity, 0) : 0} items
        </span>
      </div>

      {ready && items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="serif text-2xl text-ink-muted">Your cart is empty.</p>
          <Link href="/collections" className="mt-8 inline-block">
            <Button variant="outline" size="lg">
              Browse collections
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-16 pt-10 lg:grid-cols-3 lg:gap-20">
          {/* Lines */}
          <div className="lg:col-span-2">
            <ul className="divide-y divide-hairline border-y border-hairline">
              {items.map((line) => (
                <li
                  key={`${line.productId}-${line.size}`}
                  className="flex gap-5 py-6"
                  data-testid="cart-line"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    className="block aspect-[3/4] w-24 shrink-0 overflow-hidden bg-card sm:w-28"
                  >
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.image}
                        alt={line.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${line.slug}`}
                          className="serif text-lg text-ink transition-colors hover:text-accent"
                        >
                          {line.name}
                        </Link>
                        <p className="label label-muted mt-1">
                          Size {line.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.productId, line.size)}
                        aria-label={`Remove ${line.name}`}
                        className="text-ink-muted transition-colors hover:text-critical"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      {/* Quantity stepper */}
                      <div className="inline-flex items-center border border-hairline">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.size,
                              line.quantity - 1,
                            )
                          }
                          className="grid size-9 place-items-center text-ink transition-colors hover:bg-card"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm tabular-nums text-ink">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.size,
                              line.quantity + 1,
                            )
                          }
                          className="grid size-9 place-items-center text-ink transition-colors hover:bg-card"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <span className="serif text-lg text-ink">
                        {formatCurrency(line.priceCents * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="label label-muted">Summary</h2>
            <dl className="mt-6 space-y-3 border-t border-hairline pt-6">
              <div className="flex items-center justify-between">
                <dt className="serif text-ink-muted">Subtotal</dt>
                <dd
                  className="serif text-ink"
                  data-testid="cart-subtotal"
                >
                  {formatCurrency(subtotalCents)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="serif text-ink-muted">Shipping</dt>
                <dd className="serif text-ink-muted">Calculated at checkout</dd>
              </div>
            </dl>

            <Link href="/checkout" className="mt-8 block">
              <Button
                size="lg"
                className="w-full"
                data-testid="cart-checkout"
                disabled={items.length === 0}
              >
                Checkout
              </Button>
            </Link>
            <Link
              href="/collections"
              className="label label-muted mt-6 inline-block transition-colors hover:text-accent"
            >
              ← Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
