import { SectionWrapper } from "@/components/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

export function ActionsTaken() {
  return (
    <SectionWrapper
      title="Immediate Actions Taken"
      subtitle="Steps I have already taken to address the situation."
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6 pb-6">
          <p className="text-sm leading-relaxed mb-4">
            I acknowledge that I used Cursor beyond reasonable limits, which caused the billing spike.
            As immediate corrective action:
          </p>
          <ul className="space-y-3">
            {[
              "I have removed the company Cursor account and stopped using it effective immediately.",
              "I recognize that my identical VS Code and Cursor themes may have caused occasional accidental usage on personal projects — this was not intentional and happened rarely.",
              "I am actively working on improving my work schedule discipline to align with more conventional hours.",
              "I remain fully committed to my work at Evolphin and to being transparent about my tool usage going forward.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
