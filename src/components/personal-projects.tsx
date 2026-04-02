import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitBranch, BookOpen, FileText } from "lucide-react";

const projects = [
  {
    name: "nonlu-skill",
    badge: "Shared with Team",
    badgeVariant: "default" as const,
    what: "AI skill/plugin framework for Claude Code and Cursor",
    learned: ["Plugin architecture", "Prompt engineering", "Skill composition"],
    sharing:
      "Already shared with the team to improve AI-assisted development workflows.",
    link: "https://github.com/luv-jeri/nonlu-skill",
    linkLabel: "View on GitHub",
    icon: GitBranch,
    span: "md:col-span-2",
  },
  {
    name: "kilasroom",
    badge: "In Progress",
    badgeVariant: "secondary" as const,
    what: "AI-powered interactive classroom for learning",
    learned: ["Monorepo setup", "Education UX", "AI integration patterns"],
    sharing: "Intended for team upskilling once completed.",
    link: "https://open.maic.chat/",
    linkLabel: "View Open MAIC (upstream)",
    icon: BookOpen,
    span: "md:col-span-1",
  },
  {
    name: "nonlu",
    badge: "In Progress",
    badgeVariant: "secondary" as const,
    what: "AI-powered document sharing app — solving slow doc sharing at Evolphin",
    learned: ["Multi-tenant SaaS", "AI document processing"],
    sharing:
      "Built to address a real workflow friction. Would have been shared once ready.",
    link: "https://www.nonlu.xyz/",
    linkLabel: "Visit nonlu.xyz",
    icon: FileText,
    span: "md:col-span-3",
  },
];

export function PersonalProjects() {
  return (
    <SectionWrapper
      title="Personal Projects — Learning & Sharing"
      subtitle="I learn by building. These are upskilling projects, not commercial ventures. I share what I build with the team — and bring the patterns back to my day job."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <Card
              key={project.name}
              className={`${project.span} group relative overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg animate-slide-up`}
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg tracking-tight">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {project.what}
                      </p>
                    </div>
                  </div>
                  <Badge variant={project.badgeVariant} className="text-[10px] shrink-0 ml-2">
                    {project.badge}
                  </Badge>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.learned.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Team Sharing */}
                <p className="text-sm text-foreground/70 mb-5 flex-1">
                  {project.sharing}
                </p>

                {/* Prominent Link */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 rounded-lg transition-colors w-fit group/link"
                >
                  <ExternalLink className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                  {project.linkLabel}
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NarrativeBlock>
        <p>
          I learn by building. These projects are how I upskill myself with new
          technologies and patterns that I bring back to my day job. I shared
          nonlu-skill with the team and would have shared kilasroom and nonlu
          once they were ready. Building tools is my way of staying sharp and
          contributing beyond my immediate tasks.
        </p>
      </NarrativeBlock>
    </SectionWrapper>
  );
}
