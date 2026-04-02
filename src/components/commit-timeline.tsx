"use client";

import { Badge } from "@/components/ui/badge";

interface Commit {
  date: string;
  time: string;
  repo: string;
  repoType: string;
  sha: string;
  message: string;
}

export function CommitTimeline({ commits }: { commits: Commit[] }) {
  // Group by date
  const grouped: Record<string, Commit[]> = {};
  for (const c of commits) {
    if (!grouped[c.date]) grouped[c.date] = [];
    grouped[c.date].push(c);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-card py-1">
            {date}
          </h3>
          <div className="space-y-1.5">
            {grouped[date].map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm py-1.5 px-2 rounded hover:bg-muted/50"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap font-mono mt-0.5">
                  {c.time.slice(0, 5)}
                </span>
                <Badge
                  variant={c.repoType === "Company" ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 shrink-0"
                >
                  {c.repoType === "Company" ? "Evo" : "Per"}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {c.sha}
                </span>
                <span className="truncate">{c.message}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
