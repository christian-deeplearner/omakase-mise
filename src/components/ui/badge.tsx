import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { OrderStatus, ProductStatus } from "@/lib/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] leading-none px-2 py-1 border",
  {
    variants: {
      variant: {
        // Neutral outline on paper
        default: "border-hairline bg-transparent text-ink",
        // Solid dark
        solid: "border-panel bg-panel text-paper-on-panel",
        // Accent teal
        accent: "border-transparent bg-accent-soft text-accent",
        // Status tones — soft tinted fills, restrained
        positive: "border-transparent bg-positive/12 text-positive",
        warning: "border-transparent bg-warning/12 text-warning",
        critical: "border-transparent bg-critical/12 text-critical",
        muted: "border-hairline bg-transparent text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// ---- Domain helpers -------------------------------------------------------

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  paid: "accent",
  fulfilled: "accent",
  shipped: "default",
  delivered: "positive",
  refunded: "muted",
  cancelled: "critical",
};

/** Status pill for an order, color-mapped to Omakase status tones. */
function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]} className={className}>
      {status}
    </Badge>
  );
}

const PRODUCT_STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  active: "positive",
  archived: "muted",
  "coming-soon": "accent",
};

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "active",
  archived: "archived",
  "coming-soon": "coming soon",
};

/** Status pill for a product. */
function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <Badge variant={PRODUCT_STATUS_VARIANT[status]} className={className}>
      {PRODUCT_STATUS_LABEL[status]}
    </Badge>
  );
}

export { Badge, badgeVariants, OrderStatusBadge, ProductStatusBadge };
