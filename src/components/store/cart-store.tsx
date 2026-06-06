"use client";

// A lightweight client-side cart. No new dependencies: a tiny module-level
// store backed by localStorage so the cart survives reloads and is shared
// across the storefront (nav badge, cart page, checkout). Reads go through
// `useSyncExternalStore` so there is no setState-in-effect and SSR stays
// consistent (server renders the empty snapshot, client hydrates from
// localStorage on first paint). Lines are keyed by productId + size so the
// same product in two sizes are distinct lines.

import * as React from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "omakase.cart.v1";

type CartContextValue = {
  items: CartLine[];
  count: number; // total quantity across lines
  subtotalCents: number;
  add: (line: CartLine) => void;
  remove: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
  ready: boolean; // hydrated from localStorage yet?
};

const CartContext = React.createContext<CartContextValue | null>(null);

function lineKey(productId: string, size: string): string {
  return `${productId}::${size}`;
}

function parseLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Defensive: only keep well-shaped lines.
    return parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).productId === "string" &&
        typeof (l as CartLine).size === "string" &&
        typeof (l as CartLine).quantity === "number",
    );
  } catch {
    return [];
  }
}

// ---- Module-level store (single source of truth) --------------------------

const listeners = new Set<() => void>();
let snapshot: CartLine[] = [];
let hydrated = false;

const SERVER_SNAPSHOT: CartLine[] = [];

function emit() {
  for (const l of listeners) l();
}

function setItems(next: CartLine[]): void {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable — fail silently */
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  // First subscriber hydrates the store from localStorage.
  if (!hydrated && typeof window !== "undefined") {
    snapshot = parseLines(window.localStorage.getItem(STORAGE_KEY));
    hydrated = true;
  }
  listeners.add(listener);

  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = parseLines(e.newValue);
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartLine[] {
  return snapshot;
}

function getServerSnapshot(): CartLine[] {
  return SERVER_SNAPSHOT;
}

// `ready` is derived from the same external store: false on the server and on
// the very first client snapshot, true once `subscribe` has hydrated. Reading
// it via useSyncExternalStore avoids any setState-in-effect.
function getReadySnapshot(): boolean {
  return hydrated;
}

function getReadyServerSnapshot(): boolean {
  return false;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Hydration flag, sourced from the same external store (no setState-in-effect).
  const ready = React.useSyncExternalStore(
    subscribe,
    getReadySnapshot,
    getReadyServerSnapshot,
  );

  const add = React.useCallback((line: CartLine) => {
    const key = lineKey(line.productId, line.size);
    const prev = snapshot;
    const existing = prev.find((l) => lineKey(l.productId, l.size) === key);
    if (existing) {
      setItems(
        prev.map((l) =>
          lineKey(l.productId, l.size) === key
            ? { ...l, quantity: l.quantity + line.quantity }
            : l,
        ),
      );
    } else {
      setItems([...prev, line]);
    }
  }, []);

  const remove = React.useCallback((productId: string, size: string) => {
    const key = lineKey(productId, size);
    setItems(snapshot.filter((l) => lineKey(l.productId, l.size) !== key));
  }, []);

  const setQuantity = React.useCallback(
    (productId: string, size: string, quantity: number) => {
      const key = lineKey(productId, size);
      setItems(
        snapshot
          .map((l) =>
            lineKey(l.productId, l.size) === key
              ? { ...l, quantity: Math.max(0, Math.floor(quantity)) }
              : l,
          )
          .filter((l) => l.quantity > 0),
      );
    },
    [],
  );

  const clear = React.useCallback(() => setItems([]), []);

  const count = React.useMemo(
    () => items.reduce((sum, l) => sum + l.quantity, 0),
    [items],
  );
  const subtotalCents = React.useMemo(
    () => items.reduce((sum, l) => sum + l.priceCents * l.quantity, 0),
    [items],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotalCents,
      add,
      remove,
      setQuantity,
      clear,
      ready,
    }),
    [items, count, subtotalCents, add, remove, setQuantity, clear, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
