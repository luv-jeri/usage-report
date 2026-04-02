import { loadData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download, FileSpreadsheet, FileText, Receipt,
  CreditCard, Flame, Clock, GitCommit, Building2, FileSearch,
  Wallet, Lightbulb, CheckCircle, BarChart3, Cpu, GitPullRequest,
  GitBranch, Activity, Zap, TrendingUp, Calendar, Hash,
} from "lucide-react";
import { DailyTokenChart } from "@/components/daily-token-chart";
import { HourlyChart } from "@/components/hourly-chart";
import { RepoChart } from "@/components/repo-chart";
import { ModelBarChart } from "@/components/model-bar-chart";
import { PRStatusChart } from "@/components/pr-status-chart";
import { RatioBar } from "@/components/ratio-bar";
import { TabbedDetails } from "@/components/tabbed-details";
import { SideNav } from "@/components/side-nav";
import { ContributorChart } from "@/components/contributor-chart";
import { RepoContribCards } from "@/components/repo-contrib-card";

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

function SectionHeader({ id, icon: Icon, title, subtitle }: {
  id?: string; icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string;
}) {
  return (
    <div id={id} className="col-span-full flex items-center gap-3 pt-6 pb-1">
      <div className="p-2 rounded-lg bg-[#a855f7]/10">
        <Icon className="h-5 w-5 text-[#a855f7]" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
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
      <main className="min-h-screen bg-background py-8 pb-24 px-4 md:px-8 lg:px-10 max-w-[1400px] mx-auto lg:pr-24">

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
                  <span className="flex items-center gap-1.5"><span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-1.5 py-0 rounded-sm text-[8px]"><img src="/logos/evolphin-icon.svg" alt="" className="h-3 w-3" />Evo</span> = Evolphin</span>
                  <span className="flex items-center gap-1.5"><Badge variant="secondary" className="text-[8px] px-1.5 py-0">Per</Badge> = Personal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BENTO GRID ═══ */}
        <div className="bento-grid">

          {/* ── BILLING SECTION ── */}
          <SectionHeader id="billing" icon={CreditCard} title="Cursor Billing" subtitle="Peak day usage and cost breakdown" />
          <section className="col-span-full">
            <div className="bento-grid">
              <StatCard label="Peak Day" value={data.cursor.highestDay ? formatDate(data.cursor.highestDay.date) : "—"} accent delay="delay-100" />
              <StatCard label="Peak Tokens" value={`${((data.cursor.highestDay?.tokens || 0) / 1_000_000).toFixed(1)}M`} delay="delay-200" />
              <StatCard label="Peak Day Features" value={String(data.peakDay.features.length)} detail="Tasks worked on" delay="delay-300" />
              <StatCard label="Peak Requests" value={String(data.cursor.highestDay?.requests || 0)} detail={`${data.cursor.highestDay?.freeRequests || 0} free`} delay="delay-400" />
            </div>
          </section>

          {/* ── Peak Day: What was built + Chart ── */}
          <SectionHeader id="peak-day" icon={Flame} title="Peak Day Analysis" subtitle="What was built on the highest usage day" />
          <section className="col-span-2">
            <Card className="bento-card animate-fade-in delay-300 h-full">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-[#a855f7]" />What Was Being Built on Peak Day</CardTitle>
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
                      <Badge variant="default" className="text-[8px] px-1.5 py-0 flex items-center gap-1"><img src="/logos/evolphin-icon.svg" alt="" className="h-3 w-3" />Evo</Badge>
                      <span className="truncate">{c.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-2 bento-card animate-fade-in delay-400">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#a855f7]" />Daily Token Usage (Top 10 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <DailyTokenChart data={data.cursor.sortedDays} />
            </CardContent>
          </Card>

          {/* ── Overall stats ── */}
          <StatCard label="Total Requests" value={String(data.cursor.totalRequests)} detail={`${data.cursor.freeRequests} free · ${data.cursor.paidRequests} paid`} delay="delay-100" />
          <StatCard label="Free Requests" value={String(data.cursor.freeRequests)} detail={`${((data.cursor.freeRequests / data.cursor.totalRequests) * 100).toFixed(0)}% of total`} delay="delay-200" />
          <StatCard label="Total Commits" value={String(data.commits.total)} detail={`${data.commits.company} Evolphin · ${data.commits.personal} personal`} delay="delay-300" />
          <StatCard label="Pull Requests" value={String(data.prs.total)} detail={`${data.prs.merged} merged · all Evolphin repos`} delay="delay-400" />

          {/* ── HOURS SECTION ── */}
          <SectionHeader id="hours" icon={Clock} title="Working Hours" subtitle="Cursor usage and commit activity by hour" />
          <section className="col-span-3">
            <Card className="bento-card animate-fade-in delay-200">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-[#a855f7]" />Working Hours &mdash; Cursor Usage &amp; Commits Overlaid (IST)</CardTitle>
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
              <CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4 text-[#a855f7]" />Models Used</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ModelBarChart modelUsage={data.cursor.modelUsage} />
            </CardContent>
          </Card>

          {/* ── OUTPUT SECTION ── */}
          <SectionHeader id="output" icon={GitCommit} title="Work Output" subtitle="Commit distribution and repository breakdown" />
          <section className="col-span-1">
            <Card className="bento-card animate-fade-in delay-100 h-full">
              <CardHeader className="pb-2 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#a855f7]" />Commit Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <RepoChart repoBreakdown={data.commits.repoBreakdown} />
              </CardContent>
            </Card>
          </section>

          <Card className="col-span-1 bento-card animate-fade-in delay-200">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-base flex items-center gap-2"><img src="/logos/evolphin-icon.svg" alt="" className="h-4 w-4" /> Evolphin vs Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <RatioBar company={data.commits.company} personal={data.commits.personal} />
              <Separator />
              <div className="text-center">
                <p className="text-4xl font-bold highlight-strong">{companyPct}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Evolphin Commits</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-3xl font-bold">{repoCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Repositories</p>
              </div>
            </CardContent>
          </Card>

          {/* ── DETAILS SECTION ── */}
          <SectionHeader id="details" icon={FileSearch} title="Pull Requests & Commits" subtitle="Full list of PRs and commit history" />
          <section className="col-span-2 row-span-2">
            <Card className="bento-card animate-fade-in delay-300 h-full">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2"><GitPullRequest className="h-4 w-4 text-[#a855f7]" />Pull Requests &amp; Commits</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Narrative>
                  <p>
                    <span className="highlight-strong">Every pull request</span> I created during this period was in a
                    <span className="highlight"> Evolphin repository</span>. The work includes features (upload flow, download, share asset,
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
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#a855f7]" />PR Status</CardTitle>
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
              <CardTitle className="text-base flex items-center gap-2"><Hash className="h-4 w-4 text-[#a855f7]" />Repo Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {Object.entries(data.commits.repoBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([repo, info]) => (
                    <div key={repo} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={info.type === "Company" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 flex items-center gap-1">
                          {info.type === "Company" ? <span className="inline-flex items-center gap-1"><img src="/logos/evolphin-icon.svg" alt="" className="h-3 w-3" />Evo</span> : "Per"}
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

          {/* ── COMPANY CONTRIBUTIONS ── */}
          <SectionHeader id="company-work" icon={Building2} title="Evolphin Contributions" subtitle="Lines of code and rankings across Evolphin repos" />
          <section className="col-span-full">
            <div className="bento-grid">
              {/* Summary stat cards */}
              <StatCard label="Org Repos Contributed" value={String(data.companyContributions.reposContributed)} detail={`of ${data.companyContributions.totalOrgRepos} total`} accent delay="delay-100" />
              <StatCard label="Total Lines Added" value={(() => { const total = data.companyContributions.primaryRepos.reduce((s, r) => s + (r.contributors.find(c => c.isSelf)?.additions || 0), 0); return total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total); })()} detail="Across primary Evolphin repos" delay="delay-200" />
              <StatCard label="Primary Repos Rank" value="#1" detail="Top contributor by LOC in all 3 repos" accent delay="delay-300" />
              <StatCard label="Repos Contributed" value={String(data.companyContributions.primaryRepos.length + data.companyContributions.otherRepos.length)} detail={`${data.companyContributions.primaryRepos.length} primary · ${data.companyContributions.otherRepos.length} other`} delay="delay-400" />

              {/* Per-repo charts with LOC/Commits toggle */}
              <RepoContribCards repos={data.companyContributions.primaryRepos} />

              {/* Other repos */}
              <Card className="col-span-2 bento-card animate-fade-in delay-500">
                <CardHeader className="pb-2 px-6 pt-6">
                  <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-[#a855f7]" />Other Evolphin Repos</CardTitle>
                  <p className="text-xs text-muted-foreground">Additional repositories with Sanjay&apos;s contributions</p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-3">
                    {data.companyContributions.otherRepos.map((repo) => (
                      <div key={repo.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-[9px] px-1.5 py-0 flex items-center gap-1"><img src="/logos/evolphin-icon.svg" alt="" className="h-3 w-3" />Evo</Badge>
                          <span className="font-mono text-foreground/70">{repo.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{repo.commits} commits</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ── INVESTMENT SECTION ── */}
          <SectionHeader id="investment" icon={Wallet} title="Personal Investment" subtitle="Self-funded AI tools and billing receipts" />
          <section className="col-span-full">
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
                  <div className="md:col-span-2 space-y-4">
                    <Narrative>
                      <p>
                        I use AI extensively in my day-to-day workflow &mdash; both for <span className="highlight">learning skills and exploring new ideas</span> and
                        for <span className="highlight-strong">company work at Evolphin</span>. Since joining, I have invested approximately
                        <span className="highlight-strong"> &#x20B9;1,00,000 of my personal funds</span> on AI development tools like Claude Code,
                        Windsurf, Google AI Pro, and OpenCode. These tools are part of how I work across both contexts.
                        I am <span className="highlight">not asking for reimbursement</span> &mdash; I share this to provide the full picture.
                      </p>
                      <p className="mt-3 text-sm text-foreground/60">
                        <strong>Note:</strong> I don&apos;t have the Windsurf invoice as of now &mdash; I will get it and update this section.
                        In the billing receipts, you will see <span className="highlight">0read.fyi@gmail.com</span> &mdash; this is not a company email.
                        It is a personal email I created for billing because my account was not successfully processing payments.
                        I can share the 0read.fyi@gmail.com email credentials if needed for verification.
                      </p>
                    </Narrative>
                  </div>
                </div>
                {/* Billing receipt previews */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Billing Receipts</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Receipt-2522-7439-7590.pdf", path: "/receipt/Receipt-2522-7439-7590.pdf" },
                      { name: "Receipt-2573-1755-3555.pdf", path: "/receipt/Receipt-2573-1755-3555.pdf" },
                      { name: "Receipt-2688-4118-1190.pdf", path: "/receipt/Receipt-2688-4118-1190.pdf" },
                      { name: "Receipt-2976-2914-6118.pdf", path: "/receipt/Receipt-2976-2914-6118.pdf" },
                    ].map((file) => (
                      <a
                        key={file.name}
                        href={file.path}
                        download
                        className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg bg-card/60 border border-border/50 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/5 transition-all group"
                      >
                        <Receipt className="h-8 w-8 text-muted-foreground group-hover:text-[#a855f7] transition-colors" />
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                          {file.name.replace("Receipt-", "").replace(".pdf", "")}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">PDF</Badge>
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── PROJECTS SECTION ── */}
          <SectionHeader id="projects" icon={Lightbulb} title="Side Projects" subtitle="Upskilling projects and team-shared tools" />
          <section className="col-span-full">
            <Narrative>
              <p>
                <span className="highlight-strong">I learn by building.</span> These are upskilling projects, not commercial ventures.
                I share what I build with the team &mdash; and <span className="highlight">bring the patterns back to my day job</span>.
                I shared nonlu-skill with the team and would have shared kilasroom and nonlu once they were ready.
              </p>
            </Narrative>
            <div className="bento-grid mt-6">
              {/* nonlu-skill — wide card */}
              <Card className="col-span-2 bento-card animate-slide-up delay-300 group hover:border-[#a855f7]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#a855f7]/5">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#a855f7]/10 text-[#a855f7]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg tracking-tight">nonlu-skill</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">AI skill/plugin framework for Claude Code and Cursor</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-[10px] shrink-0 ml-2">Shared with Team</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Plugin architecture", "Prompt engineering", "Skill composition"].map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70 mb-5 flex-1">Already shared with the team to improve AI-assisted development workflows.</p>
                  <a href="https://github.com/luv-jeri/nonlu-skill" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a855f7] hover:text-[#a855f7]/80 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 px-5 py-2.5 rounded-lg transition-all duration-200 w-fit group/link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    View on GitHub
                  </a>
                </CardContent>
              </Card>

              {/* kilasroom — narrow card */}
              <Card className="col-span-1 bento-card animate-slide-up delay-400 group hover:border-[#a855f7]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#a855f7]/5">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#a855f7]/10 text-[#a855f7]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg tracking-tight">kilasroom</h3>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">AI-powered interactive classroom for learning</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Monorepo setup", "Education UX", "AI integration"].map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70 mb-5 flex-1">Intended for team upskilling once completed.</p>
                  <a href="https://open.maic.chat/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a855f7] hover:text-[#a855f7]/80 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 px-5 py-2.5 rounded-lg transition-all duration-200 w-fit group/link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    View Open MAIC
                  </a>
                </CardContent>
              </Card>

              {/* nonlu — full-width card */}
              <Card className="col-span-full bento-card animate-slide-up delay-500 group hover:border-[#a855f7]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#a855f7]/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-2.5 rounded-xl bg-[#a855f7]/10 text-[#a855f7]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg tracking-tight">nonlu</h3>
                          <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">AI-powered document sharing app — solving slow doc sharing at Evolphin</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Multi-tenant SaaS", "AI document processing"].map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{s}</span>
                      ))}
                    </div>
                    <p className="text-sm text-foreground/70 flex-1">Built to address a real workflow friction. Would have been shared once ready.</p>
                    <a href="https://www.nonlu.xyz/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a855f7] hover:text-[#a855f7]/80 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 px-5 py-2.5 rounded-lg transition-all duration-200 w-fit shrink-0 group/link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                      Visit nonlu.xyz
                    </a>
                  </div>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* ── ACTIONS SECTION ── */}
          <SectionHeader id="actions" icon={CheckCircle} title="Actions Taken" subtitle="Steps taken to address concerns" />
          <section className="col-span-full">
            <Card className="bento-card animate-fade-in delay-200 border-[#a855f7]/20">
              <CardHeader className="pb-3 px-8 pt-6">
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#a855f7]" />Immediate Actions Taken</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    "I have removed the Evolphin Cursor account and stopped using it effective immediately.",
                    "I recognize that my identical VS Code and Cursor themes may have caused occasional accidental usage on personal projects — this was not intentional.",
                    "I am actively working on improving my work schedule discipline to align with more conventional hours.",
                    "I remain fully committed to my work at Evolphin and to being transparent about my tool usage going forward.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-base">
                      <CheckCircle className="h-4 w-4 text-[#a855f7] shrink-0 mt-1" />
                      <span className="text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── DOWNLOADS SECTION ── */}
          <SectionHeader id="downloads" icon={Download} title="Download Raw Data" subtitle="Source files for independent verification" />
          <section className="col-span-full">
            <Card className="bento-card animate-fade-in delay-200 bg-gradient-to-br from-[#a855f7]/6 via-background to-[#7c3aed]/4 border-[#a855f7]/15">
              <CardHeader className="pb-2 px-8 pt-6">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-[#a855f7]" />
                  <CardTitle className="text-base">Download Raw Data</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  All source data is available for download. Run your own analysis or verify the numbers independently.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-3 gap-6 mt-2">
                  {/* Processed Data */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <FileSpreadsheet className="h-4 w-4 text-[#a855f7]" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Processed Data</p>
                    </div>
                    {[
                      { name: "commits.csv", path: "/data/commits.csv", size: "17 KB", format: "CSV" },
                      { name: "cursor-usage.csv", path: "/data/cursor-usage.csv", size: "94 KB", format: "CSV" },
                      { name: "prs.json", path: "/data/prs.json", size: "14 KB", format: "JSON" },
                      { name: "summary.json", path: "/data/summary.json", size: "1 KB", format: "JSON" },
                      { name: "company-contributions.json", path: "/data/company-contributions.json", size: "3 KB", format: "JSON" },
                    ].map((file) => (
                      <a
                        key={file.name}
                        href={file.path}
                        download
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#a855f7] transition-colors shrink-0" />
                          <span className="text-sm font-mono text-foreground/80 group-hover:text-foreground truncate transition-colors">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{file.size}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{file.format}</Badge>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Raw Data */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-[#a855f7]" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Raw Source Data</p>
                    </div>
                    {[
                      { name: "github_commits_30days.csv", path: "/data-raw/github_commits_30days.csv", size: "17 KB", format: "CSV" },
                      { name: "github_prs_30days.json", path: "/data-raw/github_prs_30days.json", size: "14 KB", format: "JSON" },
                      { name: "github_summary.json", path: "/data-raw/github_summary.json", size: "1 KB", format: "JSON" },
                      { name: "team-usage-events.csv", path: "/data-raw/team-usage-events-22215906-2026-04-02.csv", size: "94 KB", format: "CSV" },
                    ].map((file) => (
                      <a
                        key={file.name}
                        href={file.path}
                        download
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#a855f7] transition-colors shrink-0" />
                          <span className="text-sm font-mono text-foreground/80 group-hover:text-foreground truncate transition-colors">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{file.size}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{file.format}</Badge>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Billing Receipts */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Receipt className="h-4 w-4 text-[#a855f7]" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Billing Receipts</p>
                    </div>
                    {[
                      { name: "Receipt-2522-7439-7590.pdf", path: "/receipt/Receipt-2522-7439-7590.pdf", size: "32 KB" },
                      { name: "Receipt-2573-1755-3555.pdf", path: "/receipt/Receipt-2573-1755-3555.pdf", size: "33 KB" },
                      { name: "Receipt-2688-4118-1190.pdf", path: "/receipt/Receipt-2688-4118-1190.pdf", size: "35 KB" },
                      { name: "Receipt-2976-2914-6118.pdf", path: "/receipt/Receipt-2976-2914-6118.pdf", size: "34 KB" },
                    ].map((file) => (
                      <a
                        key={file.name}
                        href={file.path}
                        download
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#a855f7] transition-colors shrink-0" />
                          <span className="text-sm font-mono text-foreground/80 group-hover:text-foreground truncate transition-colors">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{file.size}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">PDF</Badge>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* AI Analysis Prompt */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Verify with AI</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download the data files above, then attach them to any AI assistant (ChatGPT, Claude, Gemini) with this prompt for an independent analysis:
                  </p>
                  <div className="bg-card/80 border border-border/50 rounded-lg p-5 font-mono text-xs text-foreground/70 leading-relaxed">
                    <p className="text-[#a855f7] mb-3 font-sans text-[10px] uppercase tracking-widest font-medium">Prompt to copy</p>
                    <p>I&apos;m attaching 4 data files for an employee&apos;s Cursor AI tool usage and GitHub activity over the last 30 days. Please perform an independent, objective audit:</p>
                    <p className="mt-3 font-sans text-[10px] text-[#a855f7] uppercase tracking-widest">Files attached:</p>
                    <p>• cursor-usage.csv — Every Cursor AI request with timestamps, model, tokens, and cost</p>
                    <p>• commits.csv — GitHub commits with timestamps, repo, and type (Company/Personal)</p>
                    <p>• prs.json — Pull requests with status, repo, and dates</p>
                    <p>• company-contributions.json — Lines of code per developer across company repos</p>
                    <p className="mt-3 font-sans text-[10px] text-[#a855f7] uppercase tracking-widest">Analyze and answer:</p>
                    <p>1. For each hour of the day, compare Cursor AI usage timestamps against commit timestamps. Are they correlated? Show a chart.</p>
                    <p>2. What percentage of total Cursor usage occurred during hours that also have commits? Calculate the overlap.</p>
                    <p>3. Break down commits by Company vs Personal. What is the ratio? Are personal commits during work hours or outside?</p>
                    <p>4. From company-contributions.json, rank the developer (luv-jeri) against teammates by lines of code added. Show a comparison chart for each repo.</p>
                    <p>5. What was the highest cost day? What was being built that day based on commit messages?</p>
                    <p>6. Is there any evidence of the AI tool being used for non-work purposes during standard business hours?</p>
                    <p>7. Generate a one-page executive summary with key metrics, charts, and your overall assessment of whether the tool usage aligns with productive work output.</p>
                  </div>
                </div>

                {/* ── Quick Note — GitHub & Chatbot ── */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="relative overflow-hidden rounded-xl border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/[0.04] via-background to-[#6366f1]/[0.04]">
                    {/* Decorative quote mark */}
                    <div className="absolute -top-4 -left-2 text-[120px] leading-none text-[#a855f7]/[0.06] font-serif pointer-events-none select-none">&ldquo;</div>
                    <div className="absolute -bottom-8 -right-2 text-[120px] leading-none text-[#6366f1]/[0.06] font-serif pointer-events-none select-none">&rdquo;</div>

                    <div className="relative p-6 space-y-5">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20">
                          <GitBranch className="w-4 h-4 text-[#a855f7]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-[#a855f7] uppercase tracking-widest font-medium">A Quick Note</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">From Sanjay</p>
                        </div>
                      </div>

                      {/* Quote-style message */}
                      <div className="pl-4 border-l-2 border-[#a855f7]/30">
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          &ldquo;If it would be helpful, I&apos;m more than happy to share my GitHub token or credentials so we can pull the data directly — it might save everyone a bit of time. It&apos;s already been shared with the team, so please don&apos;t hesitate to let me know!&rdquo;
                        </p>
                      </div>

                    </div>
                  </div>
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
