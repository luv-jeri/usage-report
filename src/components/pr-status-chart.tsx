"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  prs: Array<{ state: string }>;
}

const COLORS: Record<string, string> = {
  MERGED: "#a855f7",
  OPEN: "#22c55e",
  CLOSED: "#737373",
};

export function PRStatusChart({ prs }: Props) {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    counts[pr.state] = (counts[pr.state] || 0) + 1;
  }
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={65}
          paddingAngle={3}
          dataKey="value"
          animationDuration={1000}
          animationBegin={300}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || "#525252"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(23,23,23,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: 12,
            color: '#fafafa',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
