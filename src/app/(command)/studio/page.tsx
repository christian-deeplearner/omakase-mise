import { PageHeader } from "../_components/page-header";
import { StudioClient } from "./studio-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Studio — Omakase Command" };

export default function StudioPage() {
  // On a read-only host (Vercel) the pipeline can't write frames to /public, so
  // live generation is a local-only operation. The client uses this to serve
  // the committed gallery and explain the seam instead of erroring on a write.
  const hosted = Boolean(process.env.VERCEL);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Studio"
        description="The creative review. Brief a hero, collection, or product; generate on-brand variants; let the art director score them; approve the one that earns the slot."
      />
      <StudioClient hosted={hosted} />
    </div>
  );
}
