// src/pages/pharmacist/POS/POSDrafts.tsx
import React from "react";
import type { POSInvoice } from "../../../components/pharmacist/pos/types";
import POSReceiptModal from "../../../components/pharmacist/pos/POSReceiptModal";
import POSDashboard from "../../../components/pharmacist/pos/POSDashboard";
import InventoryManager from "../../../components/pharmacist/pos/InventoryManager";
import AccountingManager from "../../../components/pharmacist/pos/AccountingManager";
import { formatCurrency } from "../../../utils/currency";

interface Props {
  invoices: POSInvoice[];
  onViewReceipt: (id: number) => void;
}

export default function POSDrafts({ invoices, onViewReceipt }: Props) {
  const draftInvoices = invoices.filter((invoice) => invoice.status === "draft");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm text-slate-400">لوحة التحكم / نقطة البيع</p>
          <h1 className="text-3xl font-semibold">المعاملات المسودة</h1>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold">قائمة المسودات</h3>
          {draftInvoices.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/10 text-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">رقم الفاتورة</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الإجمالي</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-100">
                  {draftInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">#{String(invoice.id).padStart(6, '0')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{invoice.customer_name || "عميل مجهول"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.sale_date).toLocaleDateString("ar-SA")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(invoice.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
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
              لا توجد مسودات حالياً.
            </div>
          )}
        </div>

        {/* لوحة التحكم والإحصائيات */}
        <POSDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryManager
            cartItems={[]}
            onInventoryUpdated={(updatedItems) => {
              console.log('Inventory updated:', updatedItems);
            }}
          />

          <AccountingManager
            onDateRangeChange={(start, end) => {
              console.log('Date range changed:', start, end);
            }}
          />
        </div>
      </div>
    </div>
  );
}
