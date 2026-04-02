import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CursorEvent {
  date: string;
  model: string;
  totalTokens: number;
  kind: string;
}

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
}

interface Props {
  peakDate: string | null;
  cursorEvents: CursorEvent[];
  commits: Commit[];
  prs: PR[];
}

export function PeakCorrelation({ peakDate, cursorEvents, commits, prs }: Props) {
  if (!peakDate) return null;

  const cursorByHour: Record<string, { count: number; tokens: number; models: string[] }> = {};
  for (const e of cursorEvents) {
    const utcDate = new Date(e.date);
    const istHour = (utcDate.getUTCHours() + 5 + Math.floor((utcDate.getUTCMinutes() + 30) / 60)) % 24;
    const key = `${istHour.toString().padStart(2, "0")}:00`;
    if (!cursorByHour[key]) cursorByHour[key] = { count: 0, tokens: 0, models: [] };
    cursorByHour[key].count++;
    cursorByHour[key].tokens += e.totalTokens;
    if (!cursorByHour[key].models.includes(e.model)) cursorByHour[key].models.push(e.model);
  }

  return (
    <SectionWrapper
      title="Peak Day — Usage & Output Correlation"
      subtitle={`Side-by-side view of Cursor activity and code commits on ${peakDate} — the highest usage day.`}
    >
      <NarrativeBlock>
        <p>
          Every Cursor request on this day directly corresponded to features I was shipping.
          The timeline below shows Cursor activity alongside my actual commits — they happen
          at the same times because the tool usage IS the work.
        </p>
      </NarrativeBlock>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cursor Requests ({cursorEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(cursorByHour)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([hour, info]) => (
                  <div key={hour} className="flex items-center gap-3 text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground w-12">{hour}</span>
                    <Badge variant="secondary" className="text-[10px]">{info.count} req</Badge>
                    <span className="text-xs text-muted-foreground">
                      {(info.tokens / 1_000_000).toFixed(1)}M tokens
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commits &amp; PRs ({commits.length} commits, {prs.length} PRs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {commits.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                  <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{c.time.slice(0, 5)}</span>
                  <Badge variant={c.repoType === "Company" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {c.repoType === "Company" ? "Co" : "Per"}
                  </Badge>
                  <span className="text-xs truncate">{c.message}</span>
                </div>
              ))}
              {prs.map((pr, i) => (
                <div key={`pr-${i}`} className="flex items-start gap-3 text-sm py-1.5 px-2 rounded bg-primary/5">
                  <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">PR</span>
                  <Badge variant="default" className="text-[10px] shrink-0">{pr.state}</Badge>
                  <span className="text-xs truncate">{pr.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
