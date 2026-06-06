import { PageHeader } from "../_components/page-header";
import { StudioClient } from "./studio-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Studio — Omakase Command" };

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Studio"
        description="The creative review. Brief a hero, collection, or product; generate on-brand variants; let the art director score them; approve the one that earns the slot."
      />
      <StudioClient />
    </div>
  );
}
