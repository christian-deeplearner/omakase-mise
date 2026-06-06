"use client";

// Checkout: collects email, name, and shipping, then POSTs the cart to
// /api/store/checkout. On success it clears the cart and routes to
// /order-confirmation/[id]. Client Component (reads the cart, drives the form).

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear, ready } = useCart();

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const empty = ready && items.length === 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("name") ?? "").trim(),
      customerEmail: String(form.get("email") ?? "").trim(),
      shipping: {
        address: String(form.get("address") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        postalCode: String(form.get("postalCode") ?? "").trim(),
        country: String(form.get("country") ?? "").trim(),
      },
      items: items.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    };

    try {
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Checkout failed. Please try again.");
      }

      const data = (await res.json()) as { order: Order };
      clear();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Checkout failed. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (empty) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:px-10">
        <h1 className="display text-4xl text-ink sm:text-6xl">Checkout</h1>
        <p className="serif mt-8 text-xl text-ink-muted">
          Your cart is empty.
        </p>
        <Link href="/collections" className="mt-8 inline-block">
          <Button variant="outline" size="lg">
            Browse collections
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
      <h1 className="display border-b border-hairline pb-8 text-4xl text-ink sm:text-6xl">
        Checkout
      </h1>

      <div className="grid gap-16 pt-10 lg:grid-cols-2 lg:gap-24">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <fieldset className="space-y-5" disabled={submitting}>
            <legend className="label label-muted mb-4">Contact</legend>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@somewhere.com"
                data-testid="checkout-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                data-testid="checkout-name"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-5" disabled={submitting}>
            <legend className="label label-muted mb-4">Shipping</legend>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                required
                autoComplete="street-address"
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                  placeholder="00000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                type="text"
                required
                autoComplete="country-name"
                placeholder="Country"
              />
            </div>
          </fieldset>

          {error && (
            <p
              className="text-sm text-critical"
              role="alert"
              data-testid="checkout-error"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto sm:min-w-64"
            disabled={submitting || items.length === 0}
            data-testid="checkout-submit"
          >
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          <p className="label label-muted">
            Fictional checkout — no payment is taken.
          </p>
        </form>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="label label-muted">Order</h2>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {items.map((line) => (
              <li
                key={`${line.productId}-${line.size}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-card">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="serif text-ink">{line.name}</p>
                  <p className="label label-muted mt-1">
                    {line.size} · Qty {line.quantity}
                  </p>
                </div>
                <span className="serif text-ink">
                  {formatCurrency(line.priceCents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <dt className="serif text-ink-muted">Subtotal</dt>
              <dd className="serif text-ink">{formatCurrency(subtotalCents)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="serif text-ink-muted">Shipping</dt>
              <dd className="serif text-ink-muted">Free</dd>
            </div>
            <div className="flex items-center justify-between border-t border-hairline pt-3">
              <dt className="serif text-lg text-ink">Total</dt>
              <dd className="serif text-lg text-ink" data-testid="checkout-total">
                {formatCurrency(subtotalCents)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
