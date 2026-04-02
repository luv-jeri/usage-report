"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface Contributor {
  login: string;
  displayName: string;
  commits: number;
  additions: number;
  deletions: number;
  isSelf: boolean;
}

interface Props {
  contributors: Contributor[];
  dataKey: "commits" | "additions";
  label: string;
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ContributorChart({ contributors, dataKey, label }: Props) {
  const sorted = [...contributors]
    .filter((c) => c[dataKey] > 0)
    .sort((a, b) => b[dataKey] - a[dataKey]);

  const total = sorted.reduce((sum, c) => sum + c[dataKey], 0);

  const data = sorted.map((c, i) => ({
    name: c.displayName,
    value: c[dataKey],
    pct: total > 0 ? ((c[dataKey] / total) * 100).toFixed(1) : "0",
    rank: i + 1,
    isSelf: c.isSelf,
  }));

  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
        {label}
      </p>
      <ResponsiveContainer width="100%" height={data.length * 40 + 10}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="selfGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="otherGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
            </linearGradient>
          </defs>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={70}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
            contentStyle={{
              background: "rgba(20, 20, 20, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(168, 85, 247, 0.15)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              padding: "10px 14px",
            }}
            formatter={(value, _name, entry) => [
              `${formatNum(value as number)} (${(entry as { payload: { pct: string; rank: number } }).payload.pct}%) — #${(entry as { payload: { pct: string; rank: number } }).payload.rank}`,
              label,
            ]}
            labelStyle={{ color: "#fafafa", fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: "#a1a1a1", fontSize: 12 }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            animationDuration={1000}
            animationBegin={200}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isSelf ? "url(#selfGrad)" : "url(#otherGrad)"}
              />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
