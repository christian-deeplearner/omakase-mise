import { PageHeader } from "../_components/page-header";
import { OrdersClient } from "./orders-client";

export const metadata = { title: "Orders — Omakase Command" };

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Orders"
        description="Every order across web, wholesale, and point-of-sale — including checkouts placed live in the storefront, which land here within seconds."
      />
      <OrdersClient />
    </div>
  );
}
