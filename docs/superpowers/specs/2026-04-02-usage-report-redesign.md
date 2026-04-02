# Usage Report Redesign — Design Spec

## Purpose

Revamp the Cursor Usage & Work Activity Report into a premium, narrative-driven web report that Sanjay will attach to his email reply. The report responds to a specific request for "Cursor billing details for the highest token consumption day" while providing full context about work patterns, contributions, and personal investment.

## Audience & Tone

- **Reader:** Sanjay's manager + potentially HR
- **Tone:** Professional but human. First-person. Factual. Calm. Not defensive, not confrontational.
- **Narrative arc:** Lead with the requested data, then expand the lens to show the full picture.

## Tech Stack & Constraints

- Next.js 16.2, React 19, TypeScript
- Tailwind CSS v4 with oklch theme
- shadcn/ui v4 components ONLY: Card, Badge, Button, Tabs, Table, Separator
- Recharts 3 for charts (client components)
- tw-animate-css for animations (already installed)
- Server-side data loading via `loadData()` in `src/lib/data.ts`
- NO framer-motion, NO custom UI elements outside shadcn
- NO dark mode toggle

## Data Sources

- `public/data/cursor-usage.csv` — 671 Cursor billing events
- `public/data/commits.csv` — 137 GitHub commits (last 30 days)
- `public/data/prs.json` — 40 pull requests
- `public/data/summary.json` — Aggregated summary

## Section Design (10 sections + footer)

### Section 1: Hero Header

A clean card spanning full width. Contains:
- Name: Sanjay Kumar
- Email: sanjay.kumar@evolphin.com
- Date generated
- One-line purpose: "This report provides a transparent breakdown of my Cursor usage, correlated with my actual work output over the last 30 days."
- Subtle gradient background using primary/accent colors

### Section 2: Cursor Billing — What Was Asked

This is the direct answer to the manager's request.

**Layout:**
- 4 stat cards in a row: Date of highest day, Total Tokens (M), Total Cost ($), Request Count
- Below: Top 10 days table with columns: Date, Tokens, Requests, Free vs Paid, Cost
- Explanatory text identifying what was built on the peak day (cross-referenced from commits)

**Narrative text:**
> "The highest token consumption day was [date]. On this day, I was actively working on [features from commit messages]. The high token count is largely driven by Max Mode usage with claude-4.6-opus-high-thinking, which uses large context windows for complex code generation and review tasks. agent_review requests (automated PR reviews) also contributed significantly."

### Section 3: Peak Day Correlation

The key insight section. Shows that Cursor usage = actual work output.

**Layout:**
- Two-column layout on desktop
- Left: Cursor requests for the peak day, listed with timestamps and models
- Right: Commits and PRs from that same day, listed with timestamps and messages
- Visual: Both columns share the same time axis so the correlation is visible

**Narrative text:**
> "Every Cursor request on this day directly corresponded to features I was shipping. The timeline below shows Cursor activity alongside my actual commits — they happen at the same times because the tool usage IS the work."

### Section 4: Working Hours — Usage & Commits Overlaid

Combined hourly bar chart (24 hours) with three data series:
- Cursor requests (primary color)
- Company commits (green)
- Personal commits (amber)

**Narrative text:**
> "I work primarily in the afternoon-to-late-night window (14:00–01:00 IST). I acknowledge this is unconventional, and I am actively working on improving my schedule discipline. However, the data shows my Cursor usage and commit activity happen during the same hours — the tool usage directly produces the work output."

### Section 5: 30-Day Work Output

Overview of productivity.

**Layout:**
- 4 stat cards: Total Commits (137), Company Commits (69), Pull Requests (40, all company), Repos Contributed To (7)
- Repo breakdown table with Badge for Company/Personal, commit count, PR count
- Pie/donut chart for commit distribution

**Narrative text:**
> "Over the last 30 days, I contributed 137 commits across 7 repositories. 100% of my 40 pull requests were in Evolphin-Software company repositories. My company commit ratio is [X]%."

### Section 6: Pull Requests — Full List

Table of all 40 PRs.

**Columns:** Date, Status (Badge: MERGED/OPEN/CLOSED), Repository, Title

**Narrative text:**
> "Every pull request I created during this period was in a company repository. The work includes features (upload flow, download, share asset, search, runtime config), bug fixes, refactors, and UI improvements."

### Section 7: Personal AI Investment

Dedicated callout card with accent background.

**Content:**
- Approximate total: ~₹1,00,000
- Tools: Claude Code, Windsurf, Google AI Pro, OpenCode, and others
- Period: Since day 1 of joining
- Note: Used for company work, not asking for reimbursement

**Narrative text:**
> "Since joining Evolphin, I have invested approximately ₹1,00,000 of my personal funds on AI development tools — Claude Code, Windsurf, Google AI Pro, OpenCode, and others. I used these tools for company work because I believed they made me more productive. I am not asking for reimbursement — I share this to provide the full picture of my AI tool usage."

### Section 8: Personal Projects — Learning & Sharing

Three cards, one per project:

**nonlu-skill**
- What: AI skill/plugin framework for Claude Code and Cursor
- Learned: Plugin architecture, prompt engineering, skill composition
- Shared: Already shared with the team to improve AI-assisted development workflows

**kilasroom**
- What: Fork of an open-source project — AI-powered interactive classroom for learning
- Learned: Monorepo setup, education UX, AI integration patterns
- Would have shared: Once completed, intended for team upskilling

**nonlu**
- What: AI-powered document sharing app (solving a company pain point — slow document sharing)
- Learned: Multi-tenant SaaS architecture, AI document processing
- Would have shared: Built to address a real workflow friction at Evolphin

**Narrative text:**
> "I learn by building. These projects are how I upskill myself — not commercial ventures. I shared nonlu-skill with the team and would have shared kilasroom and nonlu once they were ready. Building tools is my way of learning new technologies and patterns that I bring back to my day job."

### Section 9: Immediate Actions Taken

Clean callout card with a subtle border.

**Content:**
> "I acknowledge that I used Cursor beyond reasonable limits, which caused the billing spike. As immediate corrective action:
> - I have removed the company Cursor account
> - I have stopped using Cursor effective immediately
> - I recognize that my identical VS Code and Cursor themes may have caused occasional accidental usage on personal projects — this was not intentional and happened rarely
> - I am actively working on improving my work schedule discipline to align with more conventional hours"

### Section 10: Commit Timeline

Scrollable timeline grouped by date, showing all 137 commits with:
- Timestamp (IST)
- Company/Personal badge
- SHA
- Commit message

### Footer

- Data source attribution
- Generation date
- "Auto-generated from Cursor billing CSV and GitHub API"

## UI & Animation Design

### Animation Strategy (tw-animate-css)
- Each section fades in on load using CSS `animate-fade-in` with staggered delays
- Stat cards use `animate-slide-in-from-bottom` with slight stagger
- Keep animations subtle — 300-500ms duration, ease-out

### Visual Hierarchy
- Hero: Larger text, subtle gradient bg
- Stat cards: Clean white cards with subtle shadow, large number + small label
- Narrative blocks: Light muted background, left border accent (like a blockquote)
- Charts: Full-width within cards, adequate padding
- Callout sections (Personal Investment, Actions Taken): Accent border + light accent bg

### Typography
- Section headers: text-2xl font-bold
- Subsection headers: text-lg font-semibold
- Body: text-sm leading-relaxed
- Stats: text-3xl font-bold for numbers, text-xs text-muted-foreground for labels

### Spacing
- Sections: py-16 with Separator between major groups
- Cards: gap-6 in grids
- Inner card padding: p-6

## Data Layer Changes

The existing `loadData()` function needs to additionally return:
- **Peak day commits:** Filter commits that match the highest usage day's date
- **Peak day cursor events sorted by hour:** For the correlation timeline
- **Peak day PR list:** PRs created/merged on that day

## File Structure

```
src/
  app/
    page.tsx          — Server component, data loading, section layout
    globals.css       — Theme (already configured)
  components/
    hero.tsx          — Section 1 (server)
    cursor-billing.tsx — Section 2 (server + client chart)
    peak-correlation.tsx — Section 3 (server)
    hourly-chart.tsx  — Section 4 chart (client)
    work-output.tsx   — Section 5 (server + client chart)
    repo-chart.tsx    — Pie chart (client)
    pr-list.tsx       — Section 6 (server)
    personal-investment.tsx — Section 7 (server)
    personal-projects.tsx — Section 8 (server)
    actions-taken.tsx — Section 9 (server)
    commit-timeline.tsx — Section 10 (client)
    daily-token-chart.tsx — Bar chart (client)
    section-wrapper.tsx — Reusable animation wrapper
    narrative-block.tsx — Reusable text block with accent styling
    stat-card.tsx     — Reusable stat card with animation
  lib/
    data.ts           — Data loading + processing
  components/ui/      — shadcn components (unchanged)
```

## Out of Scope

- Dark mode
- Export to PDF
- Interactive filters
- Authentication
- Deployment
