import { promises as fs } from "node:fs";
import path from "node:path";

import { Bot, FileText, GitCommitHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "../_components/page-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents — Omakase Command" };

// ── On-theme: the harness made legible to itself ───────────────────────────
// This page reads the repo's own Claude Code harness from disk at request time
// (.claude/agents/*.md) and its decision log (knowledge-base/decisions/*.md),
// then renders them. The point: the context that drives the build is visible
// inside the product it builds. If those files are absent (e.g. a stripped
// clone, or at build time before the harness exists), it degrades gracefully.

interface AgentDoc {
  file: string;
  name: string;
  description: string;
  tools: string[];
  model: string | null;
}

interface LogEntry {
  file: string;
  title: string;
  date: string | null;
  status: string | null;
  summary: string;
}

/** Pull a `key: value` line out of YAML frontmatter (first `---`…`---` block). */
function frontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

async function readAgents(repoRoot: string): Promise<AgentDoc[]> {
  const dir = path.join(repoRoot, ".claude", "agents");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return []; // No harness present — render gracefully.
  }

  const docs: AgentDoc[] = [];
  for (const file of files.sort()) {
    try {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const fm = frontmatter(raw);
      const name = fm.name || file.replace(/\.md$/, "");
      docs.push({
        file,
        name,
        description: fm.description || "—",
        tools: fm.tools
          ? fm.tools.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        model: fm.model || null,
      });
    } catch {
      // Skip an unreadable file rather than failing the page.
    }
  }
  return docs;
}

/** First `# Kind — Title` heading, falling back to the filename. */
function headingTitle(raw: string, file: string): string {
  const h1 = raw.match(/^#\s+(.+)$/m);
  if (h1) {
    const text = h1[1].trim();
    const dash = text.indexOf("—");
    return dash !== -1 ? text.slice(dash + 1).trim() : text;
  }
  return file.replace(/\.md$/, "");
}

/** Value of a `- **Key:** value` metadata bullet. */
function metaBullet(raw: string, key: string): string | null {
  const re = new RegExp(`-\\s*\\*\\*${key}:\\*\\*\\s*(.+)`, "i");
  const m = raw.match(re);
  return m ? m[1].trim() : null;
}

/** First substantive paragraph after the metadata bullets / first section. */
function firstParagraph(raw: string): string {
  const body = raw.replace(/^---[\s\S]*?---\s*/, "");
  const lines = body.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith("- ")) continue;
    if (t.startsWith("|")) continue;
    // Strip simple markdown emphasis/links for a clean preview.
    return t
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\((.+?)\)/g, "$1");
  }
  return "—";
}

async function readDecisions(repoRoot: string): Promise<LogEntry[]> {
  const dir = path.join(repoRoot, "knowledge-base", "decisions");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const entries: LogEntry[] = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      entries.push({
        file,
        title: headingTitle(raw, file),
        date: metaBullet(raw, "Date"),
        status: metaBullet(raw, "Status"),
        summary: firstParagraph(raw),
      });
    } catch {
      // skip
    }
  }
  // Newest first by filename (YYYY-MM-DD- prefix), then by date.
  entries.sort((a, b) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));
  return entries;
}

function statusVariant(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s === "accepted") return "positive" as const;
  if (s === "proposed") return "warning" as const;
  if (s === "superseded" || s === "rejected") return "muted" as const;
  return "accent" as const;
}

export default async function AgentsPage() {
  const repoRoot = process.cwd();
  const [agents, decisions] = await Promise.all([
    readAgents(repoRoot),
    readDecisions(repoRoot),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Command Center"
        title="Agents & Decisions"
        description="The harness, made legible. These are the repo's own Claude Code agents and decision log — read live from disk, so the context that builds Omakase is visible inside it."
      />

      {/* Agents */}
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <span className="label inline-flex items-center gap-2">
            <Bot className="size-3.5" strokeWidth={1.75} />
            Agent Roster
          </span>
          <span className="label label-muted">
            .claude/agents · {agents.length}
          </span>
        </div>

        {agents.length === 0 ? (
          <div className="flex h-32 items-center justify-center border border-dashed border-hairline">
            <span className="label label-muted">
              No agent definitions found on disk
            </span>
          </div>
        ) : (
          <ul className="border border-hairline bg-card" data-testid="agents-list">
            {agents.map((agent, i) => (
              <li
                key={agent.file}
                data-testid="agent-row"
                className={
                  i > 0
                    ? "flex flex-col gap-3 border-t border-hairline p-6 sm:flex-row sm:gap-8"
                    : "flex flex-col gap-3 p-6 sm:flex-row sm:gap-8"
                }
              >
                <div className="flex w-full shrink-0 items-start gap-3 sm:w-56">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-hairline bg-paper text-ink-muted">
                    <FileText className="size-4" strokeWidth={1.5} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-mono text-sm text-ink">
                      {agent.name}
                    </span>
                    {agent.model && (
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {agent.model}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <p className="serif text-base text-ink-muted">
                    {agent.description}
                  </p>
                  {agent.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {agent.tools.map((tool) => (
                        <Badge key={tool} variant="muted">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Decision log */}
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <span className="label inline-flex items-center gap-2">
            <GitCommitHorizontal className="size-3.5" strokeWidth={1.75} />
            Decision Log
          </span>
          <span className="label label-muted">
            knowledge-base/decisions · {decisions.length}
          </span>
        </div>

        {decisions.length === 0 ? (
          <div className="flex h-32 items-center justify-center border border-dashed border-hairline">
            <span className="label label-muted">No decisions recorded yet</span>
          </div>
        ) : (
          <ul className="flex flex-col gap-px" data-testid="decisions-list">
            {decisions.map((entry) => (
              <li
                key={entry.file}
                data-testid="decision-row"
                className="border border-hairline bg-card p-6"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="serif text-xl leading-tight text-ink">
                      {entry.title}
                    </h3>
                    {entry.status && (
                      <Badge variant={statusVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    )}
                    {entry.date && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {entry.date}
                      </span>
                    )}
                  </div>
                  <p className="serif text-base text-ink-muted">
                    {entry.summary}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
