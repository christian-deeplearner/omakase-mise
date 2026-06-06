import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderStatusBadge } from "@/components/ui/badge";
import { MetricCard } from "@/components/charts/metric-card";
import { getCustomer, getOrders } from "@/lib/data-layer";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer — Omakase Command" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) notFound();

  // Orders are stored newest-first; this customer's journey, in time order.
  const orders = getOrders({ customerId: customer.id });
  const aovCents =
    orders.length > 0
      ? Math.round(orders.reduce((s, o) => s + o.totalCents, 0) / orders.length)
      : 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-hairline pb-8">
        <Link
          href="/customers"
          className="inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
          All customers
        </Link>

        <div className="flex flex-col gap-3">
          <span className="label label-muted">Customer</span>
          <h1 className="display text-4xl sm:text-5xl">{customer.name}</h1>
          <p className="serif text-lg text-ink-muted">
            {customer.email} · {customer.location} · Patron since{" "}
            {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Lifetime metrics */}
      <section className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Lifetime Value"
          value={formatCurrency(customer.ltvCents)}
          className="border-0"
        />
        <MetricCard
          label="Orders"
          value={formatNumber(customer.ordersCount)}
          className="border-0"
        />
        <MetricCard
          label="Avg Order Value"
          value={formatCurrency(aovCents)}
          className="border-0"
        />
        <MetricCard
          label="Last Order"
          value={customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}
          className="border-0"
        />
      </section>

      {/* Order journey */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="label">Order Journey</span>
          <span className="label label-muted">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="flex h-32 items-center justify-center border border-dashed border-hairline">
            <span className="label label-muted">No orders yet</span>
          </div>
        ) : (
          <ol className="border border-hairline bg-card">
            {orders.map((o, i) => (
              <li
                key={o.id}
                className={
                  i > 0
                    ? "border-t border-hairline"
                    : undefined
                }
              >
                <Link
                  href={`/orders/${o.id}`}
                  className="flex flex-col gap-3 p-5 transition-colors hover:bg-paper sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs tabular-nums text-ink">
                      {o.number}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-[11px] text-ink-muted">
                      {formatDate(o.createdAt)}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-ink">
                      {formatCurrency(o.totalCents, o.currency)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
