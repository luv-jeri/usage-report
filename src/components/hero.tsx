import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <Card className="animate-fade-in bg-gradient-to-br from-primary/5 via-background to-accent/10 border-primary/20">
      <CardContent className="pt-8 pb-8 px-8">
        <Badge variant="secondary" className="mb-4 text-xs">Confidential Report</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Cursor Usage &amp; Work Activity Report
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
