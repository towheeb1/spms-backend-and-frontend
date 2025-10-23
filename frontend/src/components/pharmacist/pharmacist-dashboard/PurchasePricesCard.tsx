// src/components/dashboard/PurchasePricesCard.tsx
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

export default function PurchasePricesCard({
  title = "عرض أسعار المشتريات",
  totalValue = 0,
  period,
  chartData = [],
  stats = [],
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-5 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm bg-white/10 px-3 py-1 rounded-full border border-white/10">
          {periodValue}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="text-3xl font-extrabold tracking-wide mb-4">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#64748b" opacity={0.4} />
            <XAxis dataKey="name" tick={{ fill: "#cbd5f5", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#cbd5f5", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #334155" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#38bdf8" barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs md:text-sm">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="opacity-70 mb-1">{stat.label}</div>
            <div className="text-lg font-semibold">{stat.value?.toLocaleString() || "0"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}