"use client";

// PDP add-to-cart control. Owns the size selection + quantity and writes to the
// client cart store. Renders a size <Select> (only when the product has more
// than the single "OS" option) and the primary Add button. On success it shows
// a brief inline confirmation and offers a link to the cart.

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/components/store/cart-store";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const sizes = product.sizes.length ? product.sizes : ["OS"];
  const isOneSize = sizes.length === 1;

  const [size, setSize] = React.useState<string>(sizes[0]);
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const soldOut = product.inventory <= 0;
  const unavailable = product.status !== "active" || soldOut;

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    if (unavailable) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      size,
      quantity: 1,
      image: product.images[0],
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-6">
      {!isOneSize && (
        <div className="space-y-2">
          <Label htmlFor="size-select">Size</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger
              id="size-select"
              className="w-full sm:w-48"
              data-testid="size-select"
            >
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={unavailable}
          data-testid="add-to-cart"
          className="w-full sm:w-auto sm:min-w-56"
        >
          {soldOut
            ? "Sold Out"
            : product.status === "coming-soon"
              ? "Coming Soon"
              : "Add to Cart"}
        </Button>

        {added && (
          <span
            className="inline-flex items-center gap-2 text-sm text-positive"
            data-testid="added-confirmation"
            role="status"
          >
            <Check className="size-4" />
            Added —{" "}
            <Link href="/cart" className="underline underline-offset-4">
              view cart
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}
