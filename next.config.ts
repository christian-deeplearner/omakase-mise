import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /agents page reads the repo's own harness (.claude/agents/*.md) and
  // decision log (knowledge-base/decisions/*.md) from disk at request time.
  // Next's output file tracing can't detect these dynamic reads, so on a
  // serverless host they'd be missing and the page would render empty. Trace
  // them into the function bundle explicitly. Keys are route globs; values are
  // globs resolved from the project root.
  outputFileTracingIncludes: {
    "/agents": [
      "./.claude/agents/**/*.md",
      "./knowledge-base/decisions/**/*.md",
    ],
  },
};

export default nextConfig;
