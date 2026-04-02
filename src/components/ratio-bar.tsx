interface Props {
  company: number;
  personal: number;
}

export function RatioBar({ company, personal }: Props) {
  const total = company + personal;
  const pct = total > 0 ? ((company / total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5"><img src="/logos/evolphin-icon.svg" alt="" width={14} height={14} /> Evolphin Commits</span>
        <span className="highlight-strong">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] animate-slide-up"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{company} Evolphin</span>
        <span>{personal} personal</span>
      </div>
    </div>
  );
}
