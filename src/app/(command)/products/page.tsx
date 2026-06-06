import { PageHeader } from "../_components/page-header";
import { ProductsClient } from "./products-client";

export const metadata = { title: "Products — Omakase Command" };

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Products"
        description="Catalog performance ranked by realized revenue — units sold, order count, and inventory on hand, recomputed from live orders."
      />
      <ProductsClient />
    </div>
  );
}
