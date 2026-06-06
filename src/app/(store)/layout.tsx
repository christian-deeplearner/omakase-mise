// Storefront chrome: a fixed paper nav (wordmark left, minimal links right) and
// a footer anchored by the dark JOIN THE LIST block. Wraps everything in the
// client CartProvider so the nav badge, cart, and checkout share one cart.
// Calm, generous whitespace (ma).

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { CartProvider } from "@/components/store/cart-store";
import { NavCart } from "@/components/store/nav-cart";
import { NotifyBlock } from "@/components/store/notify-block";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        {/* Fixed paper nav */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-paper/90 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
            <Link href="/" aria-label="Omakase — home" className="text-ink">
              <Wordmark glyphSize={22} />
            </Link>

            <div className="flex items-center gap-6 sm:gap-9">
              <Link
                href="/collections"
                className="label text-ink transition-colors hover:text-accent"
              >
                Collections
              </Link>
              <Link
                href="/about"
                className="label hidden text-ink transition-colors hover:text-accent sm:inline-block"
              >
                About
              </Link>
              <NavCart />
            </div>
          </nav>
        </header>

        {/* Spacer for the fixed nav */}
        <div className="h-16 shrink-0" aria-hidden />

        <main className="flex-1">{children}</main>

        <footer className="mt-auto">
          <NotifyBlock />
          <div className="border-t border-hairline bg-paper">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <Link href="/" className="text-ink">
                <Wordmark glyphSize={18} showTagline />
              </Link>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <Link
                  href="/collections"
                  className="label label-muted transition-colors hover:text-accent"
                >
                  Collections
                </Link>
                <Link
                  href="/about"
                  className="label label-muted transition-colors hover:text-accent"
                >
                  About
                </Link>
                <Link
                  href="/cart"
                  className="label label-muted transition-colors hover:text-accent"
                >
                  Cart
                </Link>
              </div>
              <p className="label label-muted">
                © {new Date().getFullYear()} Omakase — Fictional goods
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
