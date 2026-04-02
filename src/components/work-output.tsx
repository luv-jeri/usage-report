import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { StatCard } from "@/components/stat-card";
import { RepoChart } from "@/components/repo-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Props {
  totalCommits: number;
  companyCommits: number;
  personalCommits: number;
  totalPRs: number;
  mergedPRs: number;
  companyPRs: number;
  repoBreakdown: Record<string, { count: number; type: string; prs: number }>;
}

export function WorkOutput({ totalCommits, companyCommits, personalCommits, totalPRs, mergedPRs, companyPRs, repoBreakdown }: Props) {
  const companyPct = ((companyCommits / totalCommits) * 100).toFixed(1);
  const repoCount = Object.keys(repoBreakdown).length;

  return (
    <SectionWrapper
      title="30-Day Work Output"
      subtitle="Overview of my contributions across all repositories over the last 30 days."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Commits" value={String(totalCommits)} delay="delay-100" />
        <StatCard label="Company Commits" value={String(companyCommits)} detail={`${companyPct}% of total`} delay="delay-200" />
        <StatCard label="Pull Requests" value={String(totalPRs)} detail={`${mergedPRs} merged · all in company repos`} delay="delay-300" />
        <StatCard label="Repositories" value={String(repoCount)} delay="delay-400" />
      </div>

      <NarrativeBlock>
        <p>
          Over the last 30 days, I contributed {totalCommits} commits across {repoCount} repositories.
          100% of my {totalPRs} pull requests were in Evolphin-Software company repositories.
          My company commit ratio is {companyPct}%.
        </p>
      </NarrativeBlock>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commit Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RepoChart repoBreakdown={repoBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repositories &amp; PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Commits</TableHead>
                  <TableHead className="text-right">PRs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(repoBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([repo, info]) => (
                    <TableRow key={repo}>
                      <TableCell className="font-mono text-xs">{repo.split("/")[1]}</TableCell>
                      <TableCell>
                        <Badge variant={info.type === "Company" ? "default" : "secondary"}>
                          {info.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{info.count}</TableCell>
                      <TableCell className="text-right">{info.prs || 0}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
