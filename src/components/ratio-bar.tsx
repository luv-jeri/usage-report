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
        <span className="text-muted-foreground">Company Commits</span>
        <span className="highlight-strong">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] animate-slide-up"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{company} company</span>
        <span>{personal} personal</span>
      </div>
    </div>
  );
}
