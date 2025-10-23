// src/pages/pharmacist/POS/POSShifts.tsx
import React from "react";
import type { POSShift } from "../../../components/pharmacist/pos/types"; // ✅ تم التعديل

interface Props {
  shifts: POSShift[];
}

export default function POSShifts({ shifts }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">الورديات</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/10 text-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">رقم الوردية</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الجهاز</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الفتح</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الإغلاق</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الرصيد الافتتاحي</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الرصيد النهائي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-100">
            {shifts.map(shift => (
              <tr key={shift.id}>
                <td className="px-6 py-4 whitespace-nowrap">{shift.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shift.register_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(shift.opened_at).toLocaleString("ar-SA")}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {shift.closed_at ? new Date(shift.closed_at).toLocaleString("ar-SA") : <span className="text-amber-400">مفتوحة</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{shift.opening_float.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shift.closing_amount?.toFixed(2) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}