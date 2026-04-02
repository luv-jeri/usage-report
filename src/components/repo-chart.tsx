"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  repoBreakdown: Record<string, { count: number; type: string; prs: number }>;
}

const COLORS = [
  "#a855f7",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#93c5fd",
];

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, name, value, percent } = props;
  if (percent < 0.05) return null;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--muted-foreground)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
    >
      {name} ({value})
    </text>
  );
}

export function RepoChart({ repoBreakdown }: Props) {
  const chartData = Object.entries(repoBreakdown)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([repo, info]) => ({
      name: repo.split("/")[1],
      value: info.count,
      type: info.type,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
          animationDuration={1200}
          animationBegin={200}
          label={renderLabel}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "rgba(23,23,23,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(value, name) => [`${value} commits`, String(name)]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
