// Order confirmation: reads the freshly-created order from the data-layer by id
// and shows the order number + line items. Server Component — the order lives
// in the same in-memory world the checkout route wrote to.

import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getOrder } from "@/lib/data-layer";
import { formatCurrency, formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:px-10 sm:py-28">
      <div className="inline-flex items-center gap-2 text-positive">
        <Check className="size-5" strokeWidth={1.5} />
        <span className="label">Order confirmed</span>
      </div>

      <h1 className="display mt-6 text-4xl text-ink sm:text-6xl">
        Thank you, {order.customerName.split(" ")[0]}.
      </h1>
      <p className="serif mt-6 text-xl text-ink-muted">
        Your selection is on its way. A confirmation has been sent to{" "}
        {order.customerEmail}.
      </p>

      <dl className="mt-12 grid grid-cols-2 gap-y-6 border-y border-hairline py-8 sm:grid-cols-3">
        <div>
          <dt className="label label-muted">Order</dt>
          <dd className="serif mt-2 text-lg text-ink" data-testid="order-number">
            {order.number}
          </dd>
        </div>
        <div>
          <dt className="label label-muted">Placed</dt>
          <dd className="serif mt-2 text-lg text-ink">
            {formatDate(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="label label-muted">Status</dt>
          <dd className="serif mt-2 text-lg capitalize text-ink">
            {order.status}
          </dd>
        </div>
      </dl>

      <section className="mt-12">
        <h2 className="label label-muted">Items</h2>
        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-4 py-5"
              data-testid="confirmation-line"
            >
              <div>
                <p className="serif text-lg text-ink">{item.name}</p>
                <p className="label label-muted mt-1">Qty {item.quantity}</p>
              </div>
              <span className="serif text-ink">
                {formatCurrency(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <dt className="serif text-ink-muted">Subtotal</dt>
            <dd className="serif text-ink">
              {formatCurrency(order.subtotalCents)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="serif text-ink-muted">Shipping</dt>
            <dd className="serif text-ink">
              {order.shippingCents === 0
                ? "Free"
                : formatCurrency(order.shippingCents)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-hairline pt-3">
            <dt className="serif text-lg text-ink">Total</dt>
            <dd
              className="serif text-lg text-ink"
              data-testid="confirmation-total"
            >
              {formatCurrency(order.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-14">
        <Link
          href="/collections"
          className="label inline-flex items-center gap-2 border-b border-hairline pb-2 text-ink transition-colors hover:border-ink hover:text-accent"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
