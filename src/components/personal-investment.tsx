import { SectionWrapper } from "@/components/section-wrapper";
import { NarrativeBlock } from "@/components/narrative-block";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  { name: "Claude Code", desc: "AI coding assistant (Anthropic)" },
  { name: "Windsurf", desc: "AI-powered IDE" },
  { name: "Google AI Pro", desc: "Gemini Pro subscription" },
  { name: "OpenCode", desc: "Open-source AI coding tools" },
];

export function PersonalInvestment() {
  return (
    <SectionWrapper
      title="Personal AI Investment"
      subtitle="AI tools I have purchased with personal funds and used for company work since day 1."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Personal Investment" value="~₹1,00,000" detail="Approximate total spend" accent />
        <StatCard label="Period" value="Since Day 1" detail="From joining to present" />
        <StatCard label="Purpose" value="Company Work" detail="Not asking for reimbursement" />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Tools Purchased with Personal Funds</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="text-xs">{tool.name}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NarrativeBlock>
        <p>
          Since joining Evolphin, I have invested approximately ₹1,00,000 of my personal funds
          on AI development tools — Claude Code, Windsurf, Google AI Pro, OpenCode, and others.
          I used these tools for company work because I believed they made me more productive.
          I am not asking for reimbursement — I share this to provide the full picture of my AI tool usage.
        </p>
      </NarrativeBlock>
    </SectionWrapper>
  );
}
