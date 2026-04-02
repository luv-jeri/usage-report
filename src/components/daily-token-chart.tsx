"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
}

export function DailyTokenChart({ data }: { data: DayData[] }) {
  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date.slice(5),
      tokens: +(d.tokens / 1_000_000).toFixed(2),
      cost: +d.cost.toFixed(2),
      requests: d.requests,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <defs>
          <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#a1a1a1" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1a1" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Tokens (M)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#a1a1a1" } }}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(23,23,23,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(value, name) => {
            if (name === "tokens") return [`${value}M tokens`, "Tokens"];
            return [String(value), String(name)];
          }}
        />
        <Bar
          dataKey="tokens"
          fill="url(#tokenGradient)"
          radius={[6, 6, 0, 0]}
          animationDuration={1000}
          animationBegin={100}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
