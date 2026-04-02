import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface PR {
  title: string;
  repository: { nameWithOwner: string };
  state: string;
  createdAt: string;
  closedAt: string | null;
  url: string;
}

interface Props {
  prs: PR[];
}

export function PRList({ prs }: Props) {
  return (
    <SectionWrapper
      title={`Pull Requests (${prs.length})`}
      subtitle="Complete list of all pull requests created in the last 30 days."
    >
      <NarrativeBlock>
        <p>
          Every pull request I created during this period was in a company repository.
          The work includes features (upload flow, download, share asset, search, runtime config),
          bug fixes, refactors, and UI improvements across multiple Evolphin-Software repositories.
        </p>
      </NarrativeBlock>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prs.map((pr, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-sm">{pr.createdAt.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        pr.state === "MERGED"
                          ? "default"
                          : pr.state === "OPEN"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {pr.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {pr.repository.nameWithOwner.split("/")[1]}
                  </TableCell>
                  <TableCell className="text-sm max-w-md truncate">{pr.title}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
