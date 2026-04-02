"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  cursorHourly: Record<number, number>;
  commitHourly: Record<number, { company: number; personal: number }>;
}

export function HourlyChart({ cursorHourly, commitHourly }: Props) {
  const chartData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    cursor: cursorHourly[h] || 0,
    companyCommits: commitHourly[h]?.company || 0,
    personalCommits: commitHourly[h]?.personal || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <defs>
          <linearGradient id="cursorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="companyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="personalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
        />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: "#a1a1a1" }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1a1" }}
          axisLine={false}
          tickLine={false}
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
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="cursor"
          name="Cursor Requests"
          fill="url(#cursorGrad)"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationBegin={100}
        />
        <Bar
          dataKey="companyCommits"
          name="Company Commits"
          fill="url(#companyGrad)"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationBegin={300}
        />
        <Bar
          dataKey="personalCommits"
          name="Personal Commits"
          fill="url(#personalGrad)"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
          animationBegin={500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
