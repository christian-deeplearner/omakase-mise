import { PageHeader } from "../_components/page-header";
import { OverviewClient } from "./overview-client";

export const metadata = { title: "Overview — Omakase Command" };

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Overview"
        description="The studio at a glance — today's orders, recent revenue, and the conversion funnel, recomputed live from the storefront."
      />
      <OverviewClient />
    </div>
  );
}
