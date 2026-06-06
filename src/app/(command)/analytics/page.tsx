import { PageHeader } from "../_components/page-header";
import { AnalyticsClient } from "./analytics-client";

export const metadata = { title: "Analytics — Omakase Command" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Analytics"
        description="Where attention becomes revenue — the conversion waterfall, and the daily revenue trend rolled up from every order."
      />
      <AnalyticsClient />
    </div>
  );
}
