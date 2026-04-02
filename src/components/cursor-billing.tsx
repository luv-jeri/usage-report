import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { StatCard } from "@/components/stat-card";
import { DailyTokenChart } from "@/components/daily-token-chart";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Props {
  highestDay: { date: string; tokens: number; cost: number; requests: number; freeRequests: number } | null;
  sortedDays: Array<{ date: string; tokens: number; cost: number; requests: number; freeRequests: number }>;
  totalRequests: number;
  totalCost: number;
  freeRequests: number;
  paidRequests: number;
  peakDayFeatures: string[];
}

export function CursorBilling({ highestDay, sortedDays, totalRequests, totalCost, freeRequests, paidRequests, peakDayFeatures }: Props) {
  return (
    <SectionWrapper
      title="Cursor Billing — What Was Asked"
      subtitle="Direct response to the requested Cursor billing details for the highest token consumption day."
    >
      {highestDay && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Peak Day" value={highestDay.date} accent delay="delay-100" />
            <StatCard label="Tokens" value={`${(highestDay.tokens / 1_000_000).toFixed(1)}M`} delay="delay-200" />
            <StatCard label="Cost" value={`$${highestDay.cost.toFixed(2)}`} delay="delay-300" />
            <StatCard label="Requests" value={String(highestDay.requests)} detail={`${highestDay.freeRequests} free`} delay="delay-400" />
          </div>

          <NarrativeBlock>
            <p>
              The highest token consumption day was <strong>{highestDay.date}</strong>. On this day, I was actively working on:
            </p>
            {peakDayFeatures.length > 0 && (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {peakDayFeatures.map((f, i) => (
                  <li key={i} className="text-xs">{f}</li>
                ))}
              </ul>
            )}
            <p className="mt-2">
              The high token count is largely driven by Max Mode usage with <code className="text-xs bg-muted px-1 rounded">claude-4.6-opus-high-thinking</code>,
              which uses large context windows for complex code generation and review tasks.
              Automated <code className="text-xs bg-muted px-1 rounded">agent_review</code> requests (PR reviews) also contributed significantly.
            </p>
          </NarrativeBlock>
        </>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Requests" value={String(totalRequests)} detail={`${freeRequests} free · ${paidRequests} on-demand`} />
        <StatCard label="Total Cost" value={`$${totalCost.toFixed(2)}`} detail="On-demand charges only" />
        <StatCard label="Free Requests" value={String(freeRequests)} detail={`${((freeRequests / totalRequests) * 100).toFixed(0)}% of total`} />
        <StatCard label="Paid Requests" value={String(paidRequests)} detail={`${((paidRequests / totalRequests) * 100).toFixed(0)}% of total`} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Daily Token Usage</h3>
          <DailyTokenChart data={sortedDays} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Days by Token Usage</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Free</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDays.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell className="text-right">{(day.tokens / 1_000_000).toFixed(2)}M</TableCell>
                  <TableCell className="text-right">{day.requests}</TableCell>
                  <TableCell className="text-right">{day.freeRequests}</TableCell>
                  <TableCell className="text-right">${day.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
