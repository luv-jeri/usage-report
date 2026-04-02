import { loadData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DailyTokenChart } from "@/components/daily-token-chart";
import { HourlyChart } from "@/components/hourly-chart";
import { RepoChart } from "@/components/repo-chart";
import { ModelBarChart } from "@/components/model-bar-chart";
import { PRStatusChart } from "@/components/pr-status-chart";
import { RatioBar } from "@/components/ratio-bar";
import { TabbedDetails } from "@/components/tabbed-details";
import { SideNav } from "@/components/side-nav";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ label, value, detail, delay = "", accent = false }: {
  label: string; value: string; detail?: string; delay?: string; accent?: boolean;
}) {
  return (
    <Card className={`bento-card animate-slide-up ${delay} ${accent ? "border-[#a855f7]/30 bg-[#a855f7]/5" : ""}`}>
      <CardContent className="pt-6 pb-5 px-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl md:text-4xl font-bold tracking-tight">{value}</p>
        {detail && <p className="text-sm text-muted-foreground mt-2">{detail}</p>}
      </CardContent>
    </Card>
  );
}

function Narrative({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#a855f7]/40 bg-[#a855f7]/5 rounded-r-lg px-5 py-4 text-base leading-relaxed text-foreground/80">
      {children}
    </div>
  );
}

export default function ReportPage() {
  const data = loadData();
  const companyPct = ((data.commits.company / data.commits.total) * 100).toFixed(1);
  const repoCount = Object.keys(data.commits.repoBreakdown).length;

  return (
    <>
      <SideNav />
      <main className="min-h-screen bg-background py-8 px-4 md:px-8 lg:px-10 max-w-[1400px] mx-auto lg:pr-24">

        {/* ═══ HERO ═══ */}
        <section id="hero">
          <Card className="bento-card animate-fade-in bg-gradient-to-br from-[#a855f7]/8 via-background to-[#7c3aed]/5 border-[#a855f7]/15 mb-6">
            <CardContent className="py-10 px-8 md:px-10">
              <Badge variant="secondary" className="mb-4 text-xs tracking-wider">Confidential Report</Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                Cursor Usage &amp; Work Activity Report
              </h1>
              <p className="text-muted-foreground text-base mb-4">
                Sanjay Kumar &mdash; sanjay.kumar@evolphin.com
              </p>
              <p className="text-base leading-relaxed text-foreground/70 max-w-2xl">
                This report provides a <span className="highlight">transparent breakdown</span> of my Cursor usage,
                correlated with my actual work output over the last 30 days. It includes the
                <span className="highlight"> requested billing details</span> for the highest token consumption day,
                along with additional context about my contributions and working patterns.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <p className="text-xs text-muted-foreground">
                  Generated on {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Badge variant="default" className="text-[8px] px-1.5 py-0">Co</Badge> = Company</span>
                  <span className="flex items-center gap-1.5"><Badge variant="secondary" className="text-[8px] px-1.5 py-0">Per</Badge> = Personal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BENTO GRID ═══ */}
        <div className="bento-grid">

          {/* ── BILLING SECTION ── */}
          <section id="billing" className="col-span-full">
            <div className="bento-grid">
              <StatCard label="Peak Day" value={data.cursor.highestDay ? formatDate(data.cursor.highestDay.date) : "—"} accent delay="delay-100" />
              <StatCard label="Peak Tokens" value={`${((data.cursor.highestDay?.tokens || 0) / 1_000_000).toFixed(1)}M`} delay="delay-200" />
              <StatCard label="Peak Cost" value={`$${(data.cursor.highestDay?.cost || 0).toFixed(2)}`} delay="delay-300" />
              <StatCard label="Peak Requests" value={String(data.cursor.highestDay?.requests || 0)} detail={`${data.cursor.highestDay?.freeRequests || 0} free`} delay="delay-400" />
            </div>
          </section>

          {/* ── Peak Day: What was built + Chart ── */}
          <section id="peak-day" className="col-span-2">
            <Card className="bento-card animate-fade-in delay-300 h-full">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base">What Was Being Built on Peak Day</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <Narrative>
                  <p>
                    The highest token consumption day was <span className="highlight-strong">{data.cursor.highestDay ? formatDate(data.cursor.highestDay.date) : "—"}</span>.
                    The high token count is largely driven by <span className="highlight-strong">Max Mode usage with claude-4.6-opus-high-thinking</span>,
                    which uses large context windows for complex code generation. Automated <span className="highlight-strong">agent_review</span> requests
                    (PR reviews) also contributed significantly.
                  </p>
                </Narrative>
                {data.peakDay.features.length > 0 && (
                  <div className="space-y-2">
                    {data.peakDay.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#a855f7] shrink-0" />
                        <span className="text-foreground/70">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Commits that day</p>
                  {data.peakDay.commits.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-foreground/60">
                      <span className="font-mono text-muted-foreground text-xs">{c.time.slice(0, 5)}</span>
                      <Badge variant="default" className="text-[8px] px-1.5 py-0">Co</Badge>
                      <span className="truncate">{c.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-2 bento-card animate-fade-in delay-400">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base">Daily Token Usage (Top 10 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <DailyTokenChart data={data.cursor.sortedDays} />
            </CardContent>
          </Card>

          {/* ── Overall stats ── */}
          <StatCard label="Total Requests" value={String(data.cursor.totalRequests)} detail={`${data.cursor.freeRequests} free · ${data.cursor.paidRequests} paid`} delay="delay-100" />
          <StatCard label="Total Cost" value={`$${data.cursor.totalCost.toFixed(2)}`} detail="On-demand charges" delay="delay-200" />
          <StatCard label="Total Commits" value={String(data.commits.total)} detail={`${data.commits.company} company · ${data.commits.personal} personal`} delay="delay-300" />
          <StatCard label="Pull Requests" value={String(data.prs.total)} detail={`${data.prs.merged} merged · all company repos`} delay="delay-400" />

          {/* ── HOURS SECTION ── */}
          <section id="hours" className="col-span-3">
            <Card className="bento-card animate-fade-in delay-200">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base">Working Hours &mdash; Cursor Usage &amp; Commits Overlaid (IST)</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Narrative>
                  <p>
                    I work primarily in the <span className="highlight-strong">afternoon-to-late-night window (14:00–01:00 IST)</span>.
                    I acknowledge this is unconventional, and I am actively working on improving my schedule discipline.
                    However, the data shows my <span className="highlight">Cursor usage and commit activity happen during the same hours</span> &mdash;
                    the tool usage directly produces the work output.
                  </p>
                </Narrative>
                <div className="mt-5">
                  <HourlyChart cursorHourly={data.cursor.hourly} commitHourly={data.commits.hourly} />
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-1 bento-card animate-fade-in delay-300">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base">Models Used</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ModelBarChart modelUsage={data.cursor.modelUsage} />
            </CardContent>
          </Card>

          {/* ── OUTPUT SECTION ── */}
          <section id="output" className="col-span-1">
            <Card className="bento-card animate-fade-in delay-100 h-full">
              <CardHeader className="pb-2 px-6 pt-6">
                <CardTitle className="text-base">Commit Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <RepoChart repoBreakdown={data.commits.repoBreakdown} />
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-1 bento-card animate-fade-in delay-200">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base">Company vs Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <RatioBar company={data.commits.company} personal={data.commits.personal} />
              <Separator />
              <div className="text-center">
                <p className="text-4xl font-bold highlight-strong">{companyPct}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Company Commits</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold">{repoCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Repositories</p>
              </div>
            </CardContent>
          </Card>

          {/* ── DETAILS SECTION ── */}
          <section id="details" className="col-span-2 row-span-2">
            <Card className="bento-card animate-fade-in delay-300 h-full">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base">Pull Requests &amp; Commits</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Narrative>
                  <p>
                    <span className="highlight-strong">Every pull request</span> I created during this period was in a
                    <span className="highlight"> company repository</span>. The work includes features (upload flow, download, share asset,
                    search, runtime config), bug fixes, refactors, and UI improvements.
                  </p>
                </Narrative>
                <div className="mt-4">
                  <TabbedDetails commits={data.commits.list} prs={data.prs.list} />
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-1 bento-card animate-fade-in delay-400">
            <CardHeader className="pb-2 px-6 pt-6">
              <CardTitle className="text-base">PR Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center px-6 pb-6">
              <PRStatusChart prs={data.prs.list} />
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#a855f7]" />Merged</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />Open</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#737373]" />Closed</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 bento-card animate-fade-in delay-500">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base">Repo Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {Object.entries(data.commits.repoBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([repo, info]) => (
                    <div key={repo} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={info.type === "Company" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
                          {info.type === "Company" ? "Co" : "Per"}
                        </Badge>
                        <span className="font-mono text-foreground/70">{repo.split("/")[1]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs">
                        <span>{info.count} commits</span>
                        {info.prs > 0 && <span>{info.prs} PRs</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* ── INVESTMENT SECTION ── */}
          <section id="investment" className="col-span-full">
            <Card className="bento-card animate-fade-in delay-200 bg-gradient-to-r from-[#a855f7]/6 via-background to-[#7c3aed]/4 border-[#a855f7]/15">
              <CardContent className="py-8 px-8">
                <div className="grid md:grid-cols-4 gap-8 items-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Personal AI Investment</p>
                    <p className="text-4xl font-bold">~&#x20B9;1,00,000</p>
                    <p className="text-sm text-muted-foreground mt-2">Since Day 1 &middot; Not asking for reimbursement</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Claude Code", "Windsurf", "Google AI Pro", "OpenCode"].map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-sm px-3 py-1">{tool}</Badge>
                    ))}
                  </div>
                  <div className="md:col-span-2">
                    <Narrative>
                      <p>
                        Since joining Evolphin, I have invested approximately <span className="highlight-strong">&#x20B9;1,00,000 of my personal funds</span> on
                        AI development tools. I used these tools for <span className="highlight">company work</span> because
                        I believed they made me more productive. I am <span className="highlight">not asking for reimbursement</span> &mdash;
                        I share this to provide the full picture.
                      </p>
                    </Narrative>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── PROJECTS SECTION ── */}
          <section id="projects" className="col-span-full">
            <div className="bento-grid">
              {[
                {
                  name: "nonlu-skill",
                  badge: "Shared with Team",
                  badgeColor: "default" as const,
                  desc: "AI skill/plugin framework for Claude Code and Cursor",
                  learned: "Plugin architecture, prompt engineering, skill composition",
                  sharing: "Already shared with the team to improve AI-assisted workflows.",
                },
                {
                  name: "kilasroom",
                  badge: "In Progress",
                  badgeColor: "secondary" as const,
                  desc: "Fork of open-source project — AI-powered interactive classroom",
                  learned: "Monorepo setup, education UX, AI integration patterns",
                  sharing: "Once completed, intended for team upskilling.",
                },
                {
                  name: "nonlu",
                  badge: "In Progress",
                  badgeColor: "secondary" as const,
                  desc: "AI-powered document sharing app — solving slow doc sharing at Evolphin",
                  learned: "Multi-tenant SaaS, AI document processing",
                  sharing: "Built to address a real workflow friction. Would have been shared once ready.",
                },
              ].map((p) => (
                <Card key={p.name} className="col-span-1 bento-card animate-slide-up delay-300">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-mono">{p.name}</CardTitle>
                      <Badge variant={p.badgeColor} className="text-[10px]">{p.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">What I Learned</p>
                      <p className="text-sm text-foreground/70">{p.learned}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Team Sharing</p>
                      <p className="text-sm text-foreground/70">{p.sharing}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="col-span-1 bento-card animate-fade-in delay-400 flex items-center">
                <CardContent className="py-6 px-6">
                  <p className="text-base leading-relaxed text-foreground/70">
                    <span className="highlight-strong">I learn by building.</span> These are upskilling projects, not commercial ventures.
                    I share what I build with the team — and bring the patterns back to my day job.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ── ACTIONS SECTION ── */}
          <section id="actions" className="col-span-full">
            <Card className="bento-card animate-fade-in delay-200 border-[#a855f7]/20">
              <CardHeader className="pb-3 px-8 pt-6">
                <CardTitle className="text-base">Immediate Actions Taken</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    "I have removed the company Cursor account and stopped using it effective immediately.",
                    "I recognize that my identical VS Code and Cursor themes may have caused occasional accidental usage on personal projects — this was not intentional.",
                    "I am actively working on improving my work schedule discipline to align with more conventional hours.",
                    "I remain fully committed to my work at Evolphin and to being transparent about my tool usage going forward.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-base">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#a855f7] shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="mt-8 pt-5 border-t border-border text-xs text-muted-foreground flex justify-between animate-fade-in delay-800">
          <p>Data: Cursor billing CSV &amp; GitHub API (luv-jeri)</p>
          <p>Generated {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </main>
    </>
  );
}
