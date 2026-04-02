import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    name: "nonlu-skill",
    badge: "Shared with Team",
    badgeVariant: "default" as const,
    what: "AI skill/plugin framework for Claude Code and Cursor",
    learned: "Plugin architecture, prompt engineering, skill composition",
    sharing: "Already shared with the team to improve AI-assisted development workflows.",
  },
  {
    name: "kilasroom",
    badge: "In Progress",
    badgeVariant: "secondary" as const,
    what: "Fork of an open-source project — AI-powered interactive classroom for learning",
    learned: "Monorepo setup, education UX, AI integration patterns",
    sharing: "Once completed, intended for team upskilling and knowledge sharing.",
  },
  {
    name: "nonlu",
    badge: "In Progress",
    badgeVariant: "secondary" as const,
    what: "AI-powered document sharing app — solving a company pain point of slow document sharing",
    learned: "Multi-tenant SaaS architecture, AI document processing",
    sharing: "Built to address a real workflow friction at Evolphin. Would have been shared with the team once ready.",
  },
];

export function PersonalProjects() {
  return (
    <SectionWrapper
      title="Personal Projects — Learning & Sharing"
      subtitle="These are upskilling projects, not commercial ventures. I learn by building."
    >
      <NarrativeBlock>
        <p>
          I learn by building. These projects are how I upskill myself with new technologies
          and patterns that I bring back to my day job. I shared nonlu-skill with the team and
          would have shared kilasroom and nonlu once they were ready. Building tools is my way
          of staying sharp and contributing beyond my immediate tasks.
        </p>
      </NarrativeBlock>

      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.name} className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-base font-mono">{project.name}</CardTitle>
                <Badge variant={project.badgeVariant} className="text-[10px]">{project.badge}</Badge>
              </div>
              <CardDescription>{project.what}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">What I Learned</p>
                <p className="text-sm">{project.learned}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Sharing</p>
                <p className="text-sm">{project.sharing}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
