"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContributorChart } from "@/components/contributor-chart";

interface Contributor {
  login: string;
  displayName: string;
  commits: number;
  additions: number;
  deletions: number;
  isSelf: boolean;
}

interface RepoContribCardProps {
  repos: {
    name: string;
    url: string;
    description: string;
    contributors: Contributor[];
    totalCommits: number;
  }[];
}

type MetricMode = "loc" | "commits";

export function RepoContribCards({ repos }: RepoContribCardProps) {
  const [mode, setMode] = useState<MetricMode>("loc");

  return (
    <>
      {/* LOC explanation + toggle */}
      <div className="col-span-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5 bg-[#a855f7]/8 border border-[#a855f7]/20 rounded-lg px-4 py-2.5">
          <span className="text-sm font-semibold text-[#c084fc]">LOC</span>
          <span className="text-sm text-foreground/70">=</span>
          <span className="text-sm text-foreground/80 font-medium">Lines of Code</span>
          <span className="text-xs text-muted-foreground ml-1">(net additions to the codebase)</span>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
          <button
            onClick={() => setMode("loc")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "loc"
                ? "bg-[#a855f7] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lines of Code
          </button>
          <button
            onClick={() => setMode("commits")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "commits"
                ? "bg-[#a855f7] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Commits
          </button>
        </div>
      </div>

      {repos.map((repo, idx) => {
        const self = repo.contributors.find((c) => c.isSelf);

        // LOC stats
        const selfLOC = self?.additions || 0;
        const totalLOC = repo.contributors.reduce((s, c) => s + c.additions, 0);
        const selfLOCPct = totalLOC > 0 ? ((selfLOC / totalLOC) * 100).toFixed(1) : "0";
        const rankByLOC =
          [...repo.contributors].sort((a, b) => b.additions - a.additions).findIndex((c) => c.isSelf) + 1;

        // Commit stats
        const selfCommits = self?.commits || 0;
        const totalCommits = repo.contributors.reduce((s, c) => s + c.commits, 0);
        const selfCommitPct = totalCommits > 0 ? ((selfCommits / totalCommits) * 100).toFixed(1) : "0";
        const rankByCommits =
          [...repo.contributors].sort((a, b) => b.commits - a.commits).findIndex((c) => c.isSelf) + 1;

        const isLOC = mode === "loc";
        const rank = isLOC ? rankByLOC : rankByCommits;
        const pct = isLOC ? selfLOCPct : selfCommitPct;
        const metricLabel = isLOC ? "LOC" : "commits";

        return (
          <Card
            key={repo.name}
            className={`col-span-2 bento-card animate-slide-up delay-${(idx + 1) * 200}`}
          >
            <CardHeader className="pb-2 px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-mono">{repo.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px]">
                    #{rank} by {metricLabel}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {pct}% of {isLOC ? "lines" : "commits"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{repo.description}</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ContributorChart
                contributors={repo.contributors}
                dataKey={isLOC ? "additions" : "commits"}
                label={isLOC ? "Lines of Code Added" : "Commits"}
              />
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
