"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Commit {
  date: string;
  time: string;
  repo: string;
  repoType: string;
  sha: string;
  message: string;
}

interface PR {
  title: string;
  repository: { nameWithOwner: string };
  state: string;
  createdAt: string;
  closedAt: string | null;
  url: string;
}

interface Props {
  commits: Commit[];
  prs: PR[];
}

export function TabbedDetails({ commits, prs }: Props) {
  const [tab, setTab] = useState<"prs" | "commits">("prs");

  return (
    <Card className="h-full">
      <CardContent className="pt-4 pb-4 h-full flex flex-col">
        <div className="flex gap-1 mb-3 bg-secondary/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("prs")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              tab === "prs" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PRs ({prs.length})
          </button>
          <button
            onClick={() => setTab("commits")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              tab === "commits" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Commits ({commits.length})
          </button>
        </div>

        <div className="overflow-y-auto flex-1 max-h-[400px] space-y-1 pr-1">
          {tab === "prs" &&
            prs.map((pr, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors">
                <span className="text-muted-foreground w-16 shrink-0">{pr.createdAt.slice(0, 10)}</span>
                <Badge
                  variant={pr.state === "MERGED" ? "default" : pr.state === "OPEN" ? "secondary" : "outline"}
                  className="text-[9px] px-1.5 py-0 shrink-0"
                >
                  {pr.state}
                </Badge>
                <span className="text-muted-foreground shrink-0 font-mono">{pr.repository.nameWithOwner.split("/")[1]}</span>
                <a href={pr.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-[#a855f7] transition-colors">{pr.title}</a>
              </div>
            ))}
          {tab === "commits" &&
            commits.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors">
                <span className="text-muted-foreground w-16 shrink-0">{c.date.slice(5)}</span>
                <span className="font-mono text-muted-foreground w-10 shrink-0">{c.time.slice(0, 5)}</span>
                <Badge
                  variant={c.repoType === "Company" ? "default" : "secondary"}
                  className="text-[9px] px-1.5 py-0 shrink-0"
                >
                  {c.repoType === "Company" ? "Evo" : "Per"}
                </Badge>
                <span className="truncate">{c.message}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
