import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderStatusBadge } from "@/components/ui/badge";
import { getCustomer, getOrder } from "@/lib/data-layer";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order — Omakase Command" };

const CHANNEL_LABEL: Record<string, string> = {
  web: "Web",
  wholesale: "Wholesale",
  pos: "Point of Sale",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <span className="label label-muted">{label}</span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const customer = getCustomer(order.customerId);

  return (
    <div className="flex flex-col gap-10">
      {/* Back + header */}
      <div className="flex flex-col gap-6 border-b border-hairline pb-8">
        <Link
          href="/orders"
          className="inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          All orders
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="label label-muted">Order</span>
            <h1 className="display text-4xl tabular-nums sm:text-5xl">
              {order.number}
            </h1>
            <p className="serif text-lg text-ink-muted">
              Placed {formatDate(order.createdAt)} ·{" "}
              {CHANNEL_LABEL[order.channel] ?? order.channel}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="self-start sm:self-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline lg:grid-cols-3">
        {/* Line items */}
        <section className="bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-baseline justify-between">
            <span className="label">Line Items</span>
            <span className="label label-muted">
              {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="flex flex-col">
            {order.items.map((item, i) => (
              <li
                key={`${item.productId}-${i}`}
                className={
                  i > 0
                    ? "flex items-baseline justify-between gap-4 border-t border-hairline py-4"
                    : "flex items-baseline justify-between gap-4 py-4"
                }
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-ink">{item.name}</span>
                  <span className="font-mono text-[11px] text-ink-muted">
                    {formatCurrency(item.priceCents, order.currency)} ×{" "}
                    {item.quantity}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-sm tabular-nums text-ink">
                  {formatCurrency(item.priceCents * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-2 border-t border-hairline pt-4">
            <Row
              label="Subtotal"
              value={
                <span className="font-mono tabular-nums">
                  {formatCurrency(order.subtotalCents, order.currency)}
                </span>
              }
            />
            <Row
              label="Shipping"
              value={
                <span className="font-mono tabular-nums">
                  {order.shippingCents === 0
                    ? "Complimentary"
                    : formatCurrency(order.shippingCents, order.currency)}
                </span>
              }
            />
            <div className="mt-1 flex items-baseline justify-between border-t border-hairline pt-4">
              <span className="label">Total</span>
              <span className="display text-2xl tabular-nums">
                {formatCurrency(order.totalCents, order.currency)}
              </span>
            </div>
          </div>
        </section>

        {/* Customer + meta */}
        <aside className="flex flex-col gap-px bg-hairline">
          <section className="bg-card p-6">
            <span className="label">Customer</span>
            <div className="mt-4 flex flex-col gap-1">
              <span className="serif text-xl text-ink">{order.customerName}</span>
              <span className="font-mono text-xs text-ink-muted">
                {order.customerEmail}
              </span>
              {customer && (
                <Link
                  href={`/customers/${customer.id}`}
                  className="mt-3 inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent transition-colors hover:underline"
                >
                  View customer journey →
                </Link>
              )}
            </div>
          </section>

          {customer && (
            <section className="bg-card p-6">
              <span className="label">Lifetime</span>
              <div className="mt-3">
                <Row
                  label="Orders"
                  value={
                    <span className="font-mono tabular-nums">
                      {customer.ordersCount}
                    </span>
                  }
                />
                <Row
                  label="LTV"
                  value={
                    <span className="font-mono tabular-nums">
                      {formatCurrency(customer.ltvCents)}
                    </span>
                  }
                />
                <Row label="Location" value={customer.location} />
              </div>
            </section>
          )}

          <section className="bg-card p-6">
            <span className="label">Order Meta</span>
            <div className="mt-3">
              <Row
                label="Order ID"
                value={
                  <span className="font-mono text-[11px] text-ink-muted">
                    {order.id}
                  </span>
                }
              />
              <Row
                label="Channel"
                value={CHANNEL_LABEL[order.channel] ?? order.channel}
              />
              <Row label="Currency" value={order.currency} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
