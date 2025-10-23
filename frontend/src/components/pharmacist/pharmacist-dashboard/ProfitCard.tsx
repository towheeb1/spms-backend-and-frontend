// src/components/dashboard/ProfitCard.tsx
import React from "react";

interface Props {
  title?: string;
  totalValue?: number;
  period?: string;
  count?: number;
}

export default function ProfitCard({
  title = "فائدة الشراء",
  totalValue = 0,
  period,
  count,
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 text-white p-5 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm bg-white/15 px-3 py-1 rounded-full border border-white/20">
          {periodValue}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="text-3xl font-extrabold tracking-wide mb-4">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
        <div className="bg-white/10 border border-white/20 rounded-xl p-3">
          <div className="opacity-80 mb-1">صافي الربح</div>
          <div className="text-lg font-semibold">{totalValue?.toLocaleString() || "0.000"}</div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-3">
          <div className="opacity-80 mb-1">عدد الحركات</div>
          <div className="text-lg font-semibold">{typeof count === "number" ? count : "--"}</div>
        </div>
      </div>
    </div>
  );
}