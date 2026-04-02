"use client";

import {
  Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

interface Props {
  modelUsage: Record<string, { count: number; tokens: number }>;
}

export function ModelBarChart({ modelUsage }: Props) {
  const data = Object.entries(modelUsage)
    .sort((a, b) => b[1].tokens - a[1].tokens)
    .slice(0, 6)
    .map(([model, info]) => ({
      name: model.replace("claude-4.6-", "").replace("claude-4.5-", ""),
      tokens: +(info.tokens / 1_000_000).toFixed(1),
      count: info.count,
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1a1' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1a1' }} axisLine={false} tickLine={false} width={140} />
        <Tooltip
          contentStyle={{
            background: 'rgba(23,23,23,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: 12,
            color: '#fafafa',
          }}
          formatter={(value, name) => {
            if (name === "tokens") return [`${value}M tokens`, "Tokens"];
            return [String(value), String(name)];
          }}
        />
        <Bar dataKey="tokens" fill="url(#barGradient)" radius={[0, 6, 6, 0]} animationDuration={1200} animationBegin={200}>
          <LabelList
            dataKey="tokens"
            position="right"
            formatter={(v) => `${v}M`}
            style={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
