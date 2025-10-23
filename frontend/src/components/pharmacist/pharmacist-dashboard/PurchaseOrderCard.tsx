// src/components/dashboard/PurchaseOrderCard.tsx
import React from "react";

interface Props {
  title?: string;
  totalValue?: number;
  period?: string;
  count?: number;
}

export default function PurchaseOrderCard({
  title = "أمر الشراء",
  totalValue = 0,
  period,
  count,
}: Props) {
  const periodValue = period || "آخر 7 أيام";

  return (
    <div className="bg-blue-600 rounded-xl p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <select className="bg-blue-700 text-sm px-2 py-1 rounded" value={periodValue} disabled>
          <option value="اليوم">اليوم</option>
          <option value="آخر 7 أيام">آخر 7 أيام</option>
          <option value="آخر 30 يوم">آخر 30 يوم</option>
          <option value="آخر 90 يوم">آخر 90 يوم</option>
        </select>
      </div>

      <div className="text-2xl font-bold mb-2">{totalValue?.toLocaleString() || "0.000"}</div>

      <div className="text-xs opacity-60 mt-4">
        إجمالي قيمة أوامر الشراء خلال الفترة.
      </div>
      {typeof count === "number" && (
        <div className="text-xs opacity-80 mt-2">عدد الأوامر المفتوحة: {count}</div>
      )}
    </div>
  );
}