"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJson } from "@/hooks/fetcher";
import { cn } from "@/lib/utils";

// ── Types mirrored from the API routes (kept structural, not imported, so the
//    client bundle never pulls in server-only modules). ─────────────────────
type CreativeKind = "hero" | "collection" | "product";

interface BriefCollectionOption {
  slug: string;
  name: string;
  glyph: string;
  tagline: string;
  character: string;
}
interface BriefProductOption {
  slug: string;
  name: string;
  collectionSlug: string;
}
interface BriefOptions {
  live: boolean;
  collections: BriefCollectionOption[];
  products: BriefProductOption[];
}

interface Variant {
  id: string;
  path: string;
  prompt: string;
  score: number;
  source: "fal" | "stub";
}
interface GenerateResponse {
  brief: { kind: CreativeKind; subject: string; slug: string };
  live: boolean;
  variants: Variant[];
}

// ── Subject selection model ─────────────────────────────────────────────────
// The picker yields a discriminated target: hero (fixed), a collection, or a
// product. From a target we derive the brief sent to /api/studio/generate.
type Target =
  | { kind: "hero" }
  | { kind: "collection"; option: BriefCollectionOption }
  | { kind: "product"; option: BriefProductOption };

function targetValue(t: Target): string {
  if (t.kind === "hero") return "hero";
  return `${t.kind}:${t.option.slug}`;
}

function scoreTone(score: number): "positive" | "warning" | "critical" {
  if (score >= 75) return "positive";
  if (score >= 55) return "warning";
  return "critical";
}

export function StudioClient({ hosted = false }: { hosted?: boolean }) {
  const { data, isLoading } = useQuery<BriefOptions>({
    queryKey: ["studio", "brief"],
    queryFn: () => fetchJson<BriefOptions>("/api/studio/brief"),
  });

  const [selected, setSelected] = React.useState<string>("hero");
  const [styleNotes, setStyleNotes] = React.useState("");
  const [count, setCount] = React.useState<number>(2);

  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<GenerateResponse | null>(null);

  // selected variant id per generated slug (the operator's approval choice)
  const [approved, setApproved] = React.useState<Record<string, string>>({});

  // Resolve the current Target from the selected dropdown value.
  const target = React.useMemo<Target | null>(() => {
    if (!data) return selected === "hero" ? { kind: "hero" } : null;
    if (selected === "hero") return { kind: "hero" };
    const [kind, slug] = selected.split(":");
    if (kind === "collection") {
      const option = data.collections.find((c) => c.slug === slug);
      return option ? { kind: "collection", option } : null;
    }
    if (kind === "product") {
      const option = data.products.find((p) => p.slug === slug);
      return option ? { kind: "product", option } : null;
    }
    return { kind: "hero" };
  }, [data, selected]);

  const briefPreview = React.useMemo(() => {
    if (!target) return null;
    if (target.kind === "hero") {
      return {
        kind: "hero" as const,
        slug: "hero",
        subject: "The hero piece — Omakase, the chef's selection",
      };
    }
    if (target.kind === "collection") {
      return {
        kind: "collection" as const,
        slug: target.option.slug,
        subject: `${target.option.name} — ${target.option.tagline}`,
        character: target.option.character,
      };
    }
    return {
      kind: "product" as const,
      slug: target.option.slug,
      subject: target.option.name,
    };
  }, [target]);

  async function onGenerate() {
    if (!briefPreview) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setApproved({});
    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...briefPreview, count }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Generate failed (${res.status})`);
      }
      const payload = (await res.json()) as GenerateResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setGenerating(false);
    }
  }

  async function onApprove(slug: string, variantId: string) {
    // Optimistic: reflect the choice immediately, then persist to the in-memory
    // server map. A failure rolls the UI back.
    const prev = approved[slug];
    setApproved((m) => ({ ...m, [slug]: variantId }));
    try {
      const res = await fetch("/api/studio/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, variantId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setApproved((m) => ({ ...m, [slug]: prev ?? "" }));
    }
  }

  const live = result?.live ?? data?.live ?? false;
  const resultSlug = result?.brief.slug;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[20rem_1fr]">
      {/* ── Brief panel ─────────────────────────────────────────────────── */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <div className="border border-hairline bg-card">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="label inline-flex items-center gap-2">
              <Wand2 className="size-3.5" strokeWidth={1.75} />
              Brief
            </span>
            <span className="label label-muted inline-flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  live ? "bg-positive" : "bg-warning",
                )}
                aria-hidden="true"
              />
              {live ? "fal · live" : "stub · offline"}
            </span>
          </div>

          <div className="flex flex-col gap-5 p-4">
            {/* Subject picker */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="studio-subject">Subject</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selected}
                  onValueChange={setSelected}
                  disabled={generating}
                >
                  <SelectTrigger
                    id="studio-subject"
                    data-testid="studio-subject"
                  >
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Storefront</SelectLabel>
                      <SelectItem value="hero">Hero — landing</SelectItem>
                    </SelectGroup>
                    {data && data.collections.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Collections</SelectLabel>
                        {data.collections.map((c) => (
                          <SelectItem
                            key={c.slug}
                            value={targetValue({ kind: "collection", option: c })}
                          >
                            {c.glyph} {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {data && data.products.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Products</SelectLabel>
                        {data.products.map((p) => (
                          <SelectItem
                            key={p.slug}
                            value={targetValue({ kind: "product", option: p })}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              )}
              {briefPreview && (
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                  {briefPreview.kind} · /images/
                  {briefPreview.kind === "hero"
                    ? "hero.jpg"
                    : briefPreview.kind === "collection"
                      ? `collections/${briefPreview.slug}.jpg`
                      : `products/${briefPreview.slug}-01.jpg`}
                </p>
              )}
            </div>

            {/* Style notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="studio-notes">Style notes (optional)</Label>
              <textarea
                id="studio-notes"
                data-testid="studio-notes"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                disabled={generating}
                rows={3}
                maxLength={400}
                placeholder="e.g. closer crop, hinoki surface, more ma…"
                className={cn(
                  "flex w-full resize-none border border-hairline bg-card px-3 py-2 text-sm text-ink",
                  "placeholder:text-ink-muted outline-none transition-colors",
                  "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              <p className="font-mono text-[10px] text-ink-muted">
                Brand light, palette, and camera are fixed. Notes nuance the
                mood only.
              </p>
            </div>

            {/* Variant count */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="studio-count">Variants</Label>
              <Select
                value={String(count)}
                onValueChange={(v) => setCount(Number(v))}
                disabled={generating}
              >
                <SelectTrigger id="studio-count" data-testid="studio-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "variant" : "variants"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hosted && (
              <p
                className="font-mono text-[11px] leading-relaxed text-ink-muted"
                data-testid="studio-hosted-notice"
              >
                Generation runs locally — it writes frames to{" "}
                <span className="text-ink">/public</span>, which the host keeps
                read-only. This demo serves the committed gallery. Run{" "}
                <span className="text-ink">pnpm generate:images</span> locally to
                make new variants.
              </p>
            )}

            <Button
              type="button"
              variant="accent"
              onClick={onGenerate}
              disabled={generating || isLoading || !briefPreview || hosted}
              data-testid="studio-generate"
            >
              <Sparkles strokeWidth={1.75} />
              {generating ? "Generating…" : "Generate"}
            </Button>

            {error && (
              <p
                className="font-mono text-[11px] text-critical"
                data-testid="studio-error"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <section className="flex min-w-0 flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <span className="label inline-flex items-center gap-2">
            <Sparkles className="size-3.5" strokeWidth={1.75} />
            Variants
          </span>
          <span className="label label-muted">
            {result
              ? `${result.variants.length} · scored by the art director`
              : "Brief a subject, then generate"}
          </span>
        </div>

        {generating ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            data-testid="studio-loading"
          >
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border border-hairline bg-card">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="flex flex-col gap-2 p-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !result ? (
          <div className="flex h-64 items-center justify-center border border-dashed border-hairline">
            <span className="label label-muted">No variants yet</span>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            data-testid="studio-results"
          >
            {result.variants.map((v) => {
              const isApproved = resultSlug
                ? approved[resultSlug] === v.id
                : false;
              return (
                <article
                  key={v.id}
                  data-testid="studio-variant"
                  data-variant-id={v.id}
                  className={cn(
                    "flex flex-col border bg-card transition-colors",
                    isApproved
                      ? "border-accent ring-1 ring-accent/40"
                      : "border-hairline",
                  )}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.path}
                      alt={`${result.brief.subject} — variant ${v.id}`}
                      className={cn(
                        "w-full object-cover",
                        result.brief.kind === "product"
                          ? "aspect-[3/4]"
                          : "aspect-[16/9]",
                      )}
                    />
                    <span
                      className="absolute left-3 top-3"
                      data-testid="studio-variant-score"
                    >
                      <Badge variant={scoreTone(v.score)}>
                        {v.score} / 100
                      </Badge>
                    </span>
                    {isApproved && (
                      <span className="absolute right-3 top-3">
                        <Badge variant="solid">
                          <Check className="size-3" strokeWidth={2} />
                          Approved
                        </Badge>
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink">
                        {v.id}
                      </span>
                      <Badge variant={v.source === "fal" ? "accent" : "muted"}>
                        {v.source === "fal" ? "fal" : "stub"}
                      </Badge>
                    </div>
                    <p className="line-clamp-4 text-[13px] leading-relaxed text-ink-muted">
                      {v.prompt}
                    </p>
                    <div className="mt-auto pt-2">
                      <Button
                        type="button"
                        variant={isApproved ? "outline" : "primary"}
                        size="sm"
                        className="w-full"
                        data-testid="studio-approve"
                        aria-pressed={isApproved}
                        onClick={() =>
                          resultSlug && onApprove(resultSlug, v.id)
                        }
                      >
                        {isApproved ? (
                          <>
                            <Check strokeWidth={2} />
                            Selected
                          </>
                        ) : (
                          "Select / approve"
                        )}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
