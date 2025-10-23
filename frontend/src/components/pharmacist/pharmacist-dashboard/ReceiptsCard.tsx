// src/components/dashboard/ReceiptsCard.tsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B"];

export default function ReceiptsCard({
  title = "إيصالات استلام",
  totalValue = 0,
  period,
  chartData = [],
  stats = [],
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  // Fallback data for display if chartData is empty
  const fallbackChartData = chartData.length > 0 ? chartData : [
    { name: "لا توجد بيانات", value: 1 }
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 text-white p-5 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm bg-white/15 px-3 py-1 rounded-full border border-white/20">
          {periodValue}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="text-3xl font-extrabold tracking-wide mb-4">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fallbackChartData}
              cx="50%"
              cy="50%"
              outerRadius={65}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {fallbackChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1f1f4a", border: "1px solid #4338ca" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs md:text-sm">
        {stats.length > 0 ? (
          stats.map((stat, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="opacity-75 mb-1">{stat.label}</div>
              <div className="text-lg font-semibold">{stat.value?.toLocaleString() || "0"}</div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="opacity-75 mb-1">لا توجد بيانات</div>
              <div className="text-lg font-semibold">—</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="opacity-75 mb-1">لا توجد بيانات</div>
              <div className="text-lg font-semibold">—</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}