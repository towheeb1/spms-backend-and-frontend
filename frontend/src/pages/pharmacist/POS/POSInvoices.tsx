// src/pages/pharmacist/POS/POSInvoices.tsx
import React from "react";
import type { POSInvoice } from "../../../components/pharmacist/pos/types"; // ✅ تم التعديل

interface Props {
  invoices?: POSInvoice[];
  onViewReceipt?: (id: number) => void;
}

export default function POSInvoices({ invoices = [], onViewReceipt }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm text-slate-400">لوحة التحكم / نقطة البيع</p>
          <h1 className="text-3xl font-semibold">فواتير البيع</h1>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold">تفاصيل الفواتير</h3>
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
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.customer_name || "عميل مجهول"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.sale_date).toLocaleDateString("ar-SA")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'posted' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onViewReceipt?.(invoice.id)}
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}