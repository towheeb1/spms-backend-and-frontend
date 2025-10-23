// src/components/dashboard/PaymentsCard.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
}

interface StatItem {
  label: string;
  value: number;
}

interface Props {
  title?: string;
  totalValue?: number;
  period?: string;
  chartData?: ChartDataItem[];
  stats?: StatItem[];
}

export default function PaymentsCard({
  title = "مدفوعات",
  totalValue = 0,
  period,
  chartData = [],
  stats = [],
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-600 via-sky-500 to-sky-700 text-white p-5 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm bg-white/15 px-3 py-1 rounded-full border border-white/20">
          {periodValue}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="text-3xl font-extrabold tracking-wide mb-4">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#0ea5e9" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fill: "#e0f2fe", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#e0f2fe", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#0c4a6e", border: "1px solid #38bdf8" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#fbbf24" barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs md:text-sm">
        {stats.map((stat, i) => (
          <div key={i} className="bg-black/15 rounded-xl p-3 border border-white/20">
            <div className="opacity-80 mb-1">{stat.label}</div>
            <div className="text-lg font-semibold">{stat.value?.toLocaleString() || "0"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}