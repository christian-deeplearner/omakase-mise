import { PageHeader } from "../_components/page-header";
import { CustomersClient } from "./customers-client";

export const metadata = { title: "Customers — Omakase Command" };

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Customers"
        description="Omakase patrons, ranked by lifetime value. Search by name, email, or city — then open a journey to see every order."
      />
      <CustomersClient />
    </div>
  );
}
