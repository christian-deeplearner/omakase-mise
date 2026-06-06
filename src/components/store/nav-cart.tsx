"use client";

// The nav cart link with a live item count. Client component because it reads
// the cart store. Renders a stable "Cart" label plus a count once hydrated to
// avoid SSR/client mismatch.

import Link from "next/link";
import { useCart } from "@/components/store/cart-store";

export function NavCart() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      className="label text-ink transition-colors hover:text-accent"
      data-testid="nav-cart"
    >
      Cart
      <span className="ml-1 tabular-nums text-ink-muted">
        ({ready ? count : 0})
      </span>
    </Link>
  );
}
