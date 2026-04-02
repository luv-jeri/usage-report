import { Card, CardContent } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  detail?: string;
  delay?: string;
  accent?: boolean;
}

export function StatCard({ label, value, detail, delay = "", accent = false }: Props) {
  return (
    <Card className={`animate-slide-up ${delay} ${accent ? "border-primary/30 bg-primary/5" : ""}`}>
      <CardContent className="pt-6 pb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
      </CardContent>
    </Card>
  );
}
