// src/pages/pharmacist/POS/POSPosted.tsx
import React from "react";
import type { POSInvoice } from "../../../components/pharmacist/pos/types";

interface Props {
  invoices: POSInvoice[];
  onViewReceipt: (id: number) => void;
}

export default function POSPosted({ invoices, onViewReceipt }: Props) {
  const postedInvoices = invoices.filter((invoice) => invoice.status === "posted");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm text-slate-400">لوحة التحكم / نقطة البيع</p>
          <h1 className="text-3xl font-semibold">الفواتير المعتمدة</h1>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold">قائمة الفواتير</h3>
          {postedInvoices.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/10 text-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">رقم الفاتورة</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الإجمالي</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-100">
                  {postedInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{invoice.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{invoice.customer_name || "عميل مجهول"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.sale_date).toLocaleDateString("ar-SA")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{invoice.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-200/80 text-emerald-900">
                          معتمد
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-200 hover:text-blue-100"
                          onClick={() => onViewReceipt(invoice.id)}
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-200">
              لا توجد فواتير معتمدة حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
