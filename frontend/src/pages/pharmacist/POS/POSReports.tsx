// src/pages/pharmacist/POS/POSReports.tsx
import React from "react";
import type { POSInvoice, PaymentMethod } from "../../../components/pharmacist/pos/types";

interface Props {
  invoices: POSInvoice[];
  payments: PaymentMethod[];
  kpis: {
    totalSales: number;
    draftCount: number;
    postedCount: number;
    avgSale: number;
  };
}

export default function POSReports({ invoices, payments, kpis }: Props) {
  const paymentUsage = payments.map((method) => {
    const count = invoices.filter((inv: any) => inv.payment_method_id === method.id).length;
    return { method, count };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard title="إجمالي المبيعات" value={kpis.totalSales} suffix="YER" />
        <ReportCard title="عدد الفواتير" value={invoices.length} />
        <ReportCard title="المسودات" value={kpis.draftCount} />
        <ReportCard title="متوسط الفاتورة" value={kpis.avgSale} suffix="YER" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">توزيع طرق الدفع</h3>
          <ul className="mt-4 space-y-3">
            {paymentUsage.map(({ method, count }) => (
              <li key={method.id} className="flex items-center justify-between text-sm text-slate-300">
                <span>{method.name}</span>
                <span className="font-medium text-white">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">نشاط المبيعات</h3>
          <div className="mt-4 space-y-2">
            {invoices.slice(0, 8).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <div>
                  <p className="font-medium text-white">فاتورة #{invoice.id}</p>
                  <p className="text-xs text-slate-400">{new Date(invoice.sale_date).toLocaleString("ar-SA")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{invoice.total.toFixed(2)} YER</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      invoice.status === "posted"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : invoice.status === "draft"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">
        {new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(value)}
        {suffix ? <span className="ml-2 text-sm text-slate-400">{suffix}</span> : null}
      </p>
    </div>
  );
}