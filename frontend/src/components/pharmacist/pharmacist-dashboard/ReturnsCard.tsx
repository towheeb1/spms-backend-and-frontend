// src/components/dashboard/ReturnsCard.tsx
import React from "react";

interface Props {
  title?: string;
  totalValue?: number;
  period?: string;
  count?: number;
}

export default function ReturnsCard({
  title = "مرتجعات الشراء",
  totalValue = 0,
  period,
  count,
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white p-5 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm bg-white/10 px-3 py-1 rounded-full border border-white/15">
          {periodValue}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="text-3xl font-extrabold tracking-wide mb-4">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="opacity-70 mb-1">عدد المرتجعات</div>
          <div className="text-lg font-semibold">{typeof count === "number" ? count : "--"}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="opacity-70 mb-1">الوصف</div>
          <div className="text-xs">بيانات إجمالية لمرتجعات الشراء خلال الفترة.</div>
        </div>
      </div>
    </div>
  );
}