# Usage Report Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the usage-report Next.js app into a premium, narrative-driven report with 10 sections, contextual explanations, correlation charts, and subtle animations — using only shadcn/ui components.

**Architecture:** Server-side data loading in `loadData()`, server components for layout/narrative, client components only for Recharts charts. Reusable `SectionWrapper` for animation, `NarrativeBlock` for styled text blocks, `StatCard` for metric cards.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS v4 (oklch theme), shadcn/ui v4, Recharts 3, tw-animate-css

---

## File Structure

```
src/
  lib/data.ts                    — MODIFY: Add peak day data extraction
  app/page.tsx                   — REWRITE: New 10-section layout
  app/globals.css                — MODIFY: Add animation utilities
  components/section-wrapper.tsx — CREATE: Reusable fade-in animation wrapper
  components/narrative-block.tsx — CREATE: Styled narrative text block
  components/stat-card.tsx       — CREATE: Animated stat card
  components/hero.tsx            — CREATE: Section 1
  components/cursor-billing.tsx  — CREATE: Section 2
  components/peak-correlation.tsx — CREATE: Section 3
  components/hourly-chart.tsx    — MODIFY: Improve styling
  components/work-output.tsx     — CREATE: Section 5
  components/repo-chart.tsx      — MODIFY: Keep as-is
  components/pr-list.tsx         — CREATE: Section 6
  components/personal-investment.tsx — CREATE: Section 7
  components/personal-projects.tsx — CREATE: Section 8
  components/actions-taken.tsx   — CREATE: Section 9
  components/commit-timeline.tsx — MODIFY: Improve styling
  components/daily-token-chart.tsx — MODIFY: Improve styling
```

---

### Task 1: Data Layer — Add Peak Day Extraction

**Files:**
- Modify: `src/lib/data.ts`

- [ ] **Step 1: Add peak day commit/cursor/PR extraction to `loadData()`**

At the end of the `loadData()` function, after the existing return object is built, add these computed fields:

```typescript
// After existing code, before the return statement:

// Peak day data extraction
const peakDate = highestDay ? highestDay[0] : null;

// Peak day commits (match date — commits CSV dates are IST like "2026-03-22")
const peakDayCommits = peakDate
  ? commits.filter((c) => c.date === peakDate)
  : [];

// Peak day cursor events sorted by time
const peakDayCursorEvents = peakDate
  ? cursorEvents
      .filter((e) => e.date.startsWith(peakDate))
      .sort((a, b) => a.date.localeCompare(b.date))
  : [];

// Peak day PRs
const peakDayPRs = peakDate
  ? prs.filter((p) => p.createdAt.startsWith(peakDate))
  : [];

// Compute feature summary from peak day commit messages
const peakDayFeatures = peakDayCommits
  .map((c) => c.message)
  .filter((m) => m.startsWith("feat") || m.startsWith("fix") || m.startsWith("refactor"))
  .slice(0, 5);

// Peak day model breakdown
const peakDayModelBreakdown: Record<string, { count: number; tokens: number }> = {};
for (const e of peakDayCursorEvents) {
  if (!peakDayModelBreakdown[e.model]) peakDayModelBreakdown[e.model] = { count: 0, tokens: 0 };
  peakDayModelBreakdown[e.model].count++;
  peakDayModelBreakdown[e.model].tokens += e.totalTokens;
}
```

Add these to the return object under a new `peakDay` key:

```typescript
return {
  cursor: { /* existing */ },
  commits: { /* existing */ },
  prs: { /* existing */ },
  peakDay: {
    date: peakDate,
    commits: peakDayCommits,
    cursorEvents: peakDayCursorEvents,
    prs: peakDayPRs,
    features: peakDayFeatures,
    modelBreakdown: peakDayModelBreakdown,
  },
};
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds (page.tsx will have unused data but that's fine — we'll rewrite it next)

- [ ] **Step 3: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: add peak day data extraction to loadData"
```

---

### Task 2: Reusable UI Primitives — SectionWrapper, NarrativeBlock, StatCard

**Files:**
- Create: `src/components/section-wrapper.tsx`
- Create: `src/components/narrative-block.tsx`
- Create: `src/components/stat-card.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add animation utility classes to globals.css**

Append to the end of `src/app/globals.css`:

```css
/* Animation utilities */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
```

- [ ] **Step 2: Create SectionWrapper**

Create `src/components/section-wrapper.tsx`:

```tsx
import { Separator } from "@/components/ui/separator";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  delay?: string;
  showSeparator?: boolean;
}

export function SectionWrapper({ children, title, subtitle, delay = "", showSeparator = true }: Props) {
  return (
    <>
      {showSeparator && <Separator className="my-4" />}
      <section className={`py-12 animate-fade-in ${delay}`}>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{subtitle}</p>}
        {children}
      </section>
    </>
  );
}
```

- [ ] **Step 3: Create NarrativeBlock**

Create `src/components/narrative-block.tsx`:

```tsx
interface Props {
  children: React.ReactNode;
}

export function NarrativeBlock({ children }: Props) {
  return (
    <div className="border-l-4 border-primary/30 bg-muted/50 rounded-r-lg px-5 py-4 my-6 text-sm leading-relaxed text-foreground/80">
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create StatCard**

Create `src/components/stat-card.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  detail?: string;
  delay?: string;
  accent?: boolean;
}

export function StatCard({ label, value, detail, delay = "", accent = false }: Props) {
  return (
    <Card className={`animate-slide-up ${delay} ${accent ? "border-primary/30 bg-primary/5" : ""}`}>
      <CardContent className="pt-6 pb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/section-wrapper.tsx src/components/narrative-block.tsx src/components/stat-card.tsx src/app/globals.css
git commit -m "feat: add reusable UI primitives — SectionWrapper, NarrativeBlock, StatCard"
```

---

### Task 3: Section 1 — Hero Header

**Files:**
- Create: `src/components/hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/hero.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <Card className="animate-fade-in bg-gradient-to-br from-primary/5 via-background to-accent/10 border-primary/20">
      <CardContent className="pt-8 pb-8 px-8">
        <Badge variant="secondary" className="mb-4 text-xs">Confidential Report</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Cursor Usage & Work Activity Report
        </h1>
        <p className="text-muted-foreground text-base mb-4">
          Sanjay Kumar &mdash; sanjay.kumar@evolphin.com
        </p>
        <p className="text-sm leading-relaxed text-foreground/80 max-w-2xl">
          This report provides a transparent breakdown of my Cursor usage, correlated with my actual
          work output over the last 30 days. It includes the requested billing details for the highest
          token consumption day, along with additional context about my contributions and working patterns.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/hero.tsx
git commit -m "feat: add Hero header component"
```

---

### Task 4: Section 2 — Cursor Billing (What Was Asked)

**Files:**
- Create: `src/components/cursor-billing.tsx`
- Modify: `src/components/daily-token-chart.tsx` (minor styling)

- [ ] **Step 1: Create CursorBilling component**

Create `src/components/cursor-billing.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cursor-billing.tsx
git commit -m "feat: add CursorBilling section component"
```

---

### Task 5: Section 3 — Peak Day Correlation

**Files:**
- Create: `src/components/peak-correlation.tsx`

- [ ] **Step 1: Create PeakCorrelation component**

Create `src/components/peak-correlation.tsx`:

```tsx
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

  // Group cursor events by hour (IST)
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
        {/* Left: Cursor Activity */}
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

        {/* Right: Commits & PRs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commits & PRs ({commits.length} commits, {prs.length} PRs)</CardTitle>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/peak-correlation.tsx
git commit -m "feat: add PeakCorrelation section — side-by-side cursor/commit view"
```

---

### Task 6: Section 4 — Working Hours (Improve Existing HourlyChart)

**Files:**
- Modify: `src/components/hourly-chart.tsx`

- [ ] **Step 1: Update HourlyChart with improved styling**

Rewrite `src/components/hourly-chart.tsx` to use chart theme colors and better formatting. The existing code is functional — just needs visual polish. Keep the same props interface and data shape. Ensure `fill` values use the CSS custom property colors: `var(--chart-1)`, `var(--chart-2)`, `var(--chart-3)` instead of hardcoded oklch strings.

- [ ] **Step 2: Commit**

```bash
git add src/components/hourly-chart.tsx
git commit -m "refactor: improve HourlyChart styling with theme colors"
```

---

### Task 7: Section 5 — Work Output

**Files:**
- Create: `src/components/work-output.tsx`

- [ ] **Step 1: Create WorkOutput component**

Create `src/components/work-output.tsx` with:
- SectionWrapper with title "30-Day Work Output"
- 4 StatCards: Total Commits, Company Commits, Pull Requests, Repos
- NarrativeBlock with the company commit ratio text
- Repo breakdown table (repo name, type badge, commits, PRs)
- RepoChart (existing pie chart component)

Props: `commits` object and `prs` object from `loadData()` return value.

- [ ] **Step 2: Commit**

```bash
git add src/components/work-output.tsx
git commit -m "feat: add WorkOutput section component"
```

---

### Task 8: Section 6 — PR List

**Files:**
- Create: `src/components/pr-list.tsx`

- [ ] **Step 1: Create PRList component**

Create `src/components/pr-list.tsx` with:
- SectionWrapper with title "Pull Requests (N)"
- NarrativeBlock explaining all PRs are in company repos
- Table with columns: Date, Status (Badge), Repository, Title

Props: `prs` array from `loadData()`.

- [ ] **Step 2: Commit**

```bash
git add src/components/pr-list.tsx
git commit -m "feat: add PRList section component"
```

---

### Task 9: Sections 7, 8, 9 — Personal Investment, Projects, Actions Taken

**Files:**
- Create: `src/components/personal-investment.tsx`
- Create: `src/components/personal-projects.tsx`
- Create: `src/components/actions-taken.tsx`

- [ ] **Step 1: Create PersonalInvestment component**

Create `src/components/personal-investment.tsx`:
- SectionWrapper with title "Personal AI Investment"
- Card with accent background showing ~₹1,00,000 spend
- List of tools: Claude Code, Windsurf, Google AI Pro, OpenCode
- NarrativeBlock with the "not asking for reimbursement" text

- [ ] **Step 2: Create PersonalProjects component**

Create `src/components/personal-projects.tsx`:
- SectionWrapper with title "Personal Projects — Learning & Sharing"
- NarrativeBlock with "I learn by building" intro
- 3 Cards in a grid, one per project (nonlu-skill, kilasroom, nonlu)
- Each card: project name, what it is, what was learned, sharing status with team

- [ ] **Step 3: Create ActionsTaken component**

Create `src/components/actions-taken.tsx`:
- SectionWrapper with title "Immediate Actions Taken"
- Card with accent border listing the 4 corrective actions
- Tone: accountable and forward-looking

- [ ] **Step 4: Commit**

```bash
git add src/components/personal-investment.tsx src/components/personal-projects.tsx src/components/actions-taken.tsx
git commit -m "feat: add PersonalInvestment, PersonalProjects, ActionsTaken sections"
```

---

### Task 10: Rewrite page.tsx — Assemble All Sections

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx to compose all 10 sections**

Replace the entire content of `src/app/page.tsx` with:
- Import `loadData` and all section components
- Call `loadData()` at top level (server component)
- Render sections 1-10 in order, passing appropriate data as props
- Add footer at the bottom
- Use `max-w-5xl mx-auto px-4 md:px-8 py-8` for layout
- Remove all old imports and JSX

- [ ] **Step 2: Delete unused old components**

Remove old files that are fully replaced: none should need deletion since we're reusing `daily-token-chart.tsx`, `hourly-chart.tsx`, `repo-chart.tsx`, `commit-timeline.tsx`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 4: Verify dev server**

Run: `npm run dev`
Open `http://localhost:3001` and visually verify all 10 sections render correctly.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite page.tsx — assemble all 10 sections into narrative report"
```

---

### Task 11: Final Polish — Verify Build & Clean Up

**Files:**
- All files

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean build, no errors, no warnings

- [ ] **Step 2: Visual check**

Start dev server, open in browser, scroll through all sections. Verify:
- Hero renders with gradient
- Cursor billing shows stats and table
- Peak correlation shows two-column layout
- Working hours chart shows all 3 data series
- Work output shows stats + repo table + pie chart
- PR list renders all 40 PRs
- Personal investment callout card renders
- Personal projects shows 3 cards
- Actions taken renders cleanly
- Commit timeline is scrollable
- Animations are subtle and staggered
- All narrative blocks have accent left border

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "polish: final cleanup and visual verification"
```
