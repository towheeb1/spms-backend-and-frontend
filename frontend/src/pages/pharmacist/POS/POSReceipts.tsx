// src/pages/pharmacist/POS/POSReceipts.tsx
import React from "react";
import type { POSReceipt } from "../../../components/pharmacist/pos/types"; // ✅ تم التعديل

interface Props {
  receipt: POSReceipt | null;
}

export default function POSReceipts({ receipt }: Props) {
  if (!receipt) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">لا توجد فاتورة محددة لعرضها.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-white mb-4">فاتورة # {receipt.invoice.id}</h3>
      <div className="mb-4 text-slate-300">
        <p>العميل: {receipt.invoice.customer_name || "عميل مجهول"}</p>
        <p>التاريخ: {new Date(receipt.invoice.sale_date).toLocaleString("ar-SA")}</p>
        <p>الحالة: 
          <span className={`mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            receipt.invoice.status === 'posted' ? 'bg-green-500/20 text-green-300' :
            receipt.invoice.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {receipt.invoice.status}
          </span>
        </p>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-white mb-2">العناصر:</h4>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/10 text-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">الاسم</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">الكمية</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">السعر</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-100">
              {receipt.items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.medicine_name}</td>
                  <td className="px-4 py-2">{item.qty}</td>
                  <td className="px-4 py-2">{item.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.line_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-white mb-2">الدفعات:</h4>
        <div className="space-y-1 text-slate-100">
          {receipt.payments.map((p, i) => (
            <div key={i} className="flex justify-between">
              <span>{p.method_name}</span>
              <span>
                {p.amount.toFixed(2)} {p.is_change ? <span className="text-slate-400 text-xs">(متبقي)</span> : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-right font-bold text-lg border-t border-white/10 pt-2 text-white">
        الإجمالي: {receipt.invoice.total.toFixed(2)}
      </div>
    </div>
  );
}