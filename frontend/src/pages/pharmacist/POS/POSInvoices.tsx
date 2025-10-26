// src/pages/pharmacist/POS/POSInvoices.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listSales, getSaleById, returnSale, type ReturnSaleItemPayload } from "../../../services/sales";
import { listPurchaseSummaries, getPurchaseInvoiceById, type PurchaseInvoiceResponse } from "../../../services/suppliers";
import { useToast } from "../../../components/ui/Toast";
import type { POSInvoice, POSReceipt } from "../../../components/pharmacist/pos/types";
import { formatCurrency } from "../../../utils/currency";
import POSReceiptModal from "../../../components/pharmacist/pos/POSReceiptModal";
import POSReturnModal from "../../../components/pharmacist/pos/POSReturnModal";

type InvoiceSource = "sales" | "purchases" | "returns";

interface PurchaseInvoiceSummary {
  id: number | string;
  supplier_name: string;
  order_date: string | null;
  total_amount: number;
  status: string;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  posted: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  void: "bg-red-100 text-red-800",
  returned: "bg-amber-100 text-amber-800",
  ordered: "bg-blue-100 text-blue-800",
  received: "bg-green-100 text-green-800",
  partial: "bg-orange-100 text-orange-800",
};

function statusClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-800";
  return STATUS_BADGE_CLASS[status] ?? "bg-slate-100 text-slate-800";
}

function PurchaseInvoiceModal({ detail, onClose }: { detail: PurchaseInvoiceResponse; onClose: () => void }) {
  const items = detail.items || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-slate-900 p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">فاتورة المورد #{detail.id}</h3>
            <p className="text-xs text-slate-400">
              التاريخ: {detail.order_date ? new Date(detail.order_date).toLocaleString("ar-SA") : "غير متوفر"}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="grid gap-3 rounded-2xl bg-white/5 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">المورد</span>
            <span>{detail.supplier_name || "مورد غير معروف"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">الإجمالي</span>
            <span>{formatCurrency(Number(detail.total_amount || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">الحالة</span>
            <span>{detail.status || "—"}</span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-200">تفاصيل العناصر</h4>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10 text-slate-200">
                <tr>
                  <th className="px-4 py-2 text-right">العنصر</th>
                  <th className="px-4 py-2 text-right">الكمية</th>
                  <th className="px-4 py-2 text-right">سعر الوحدة</th>
                  <th className="px-4 py-2 text-right">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const name = item.name || item.medicine_name || `عنصر ${index + 1}`;
                    const qty = Number(item.quantity || 0);
                    const unitPrice = Number(item.unit_price || 0);
                    const lineTotal = Number(item.line_total ?? qty * unitPrice);
                    return (
                      <tr key={`${name}-${index}`} className="hover:bg-white/5">
                        <td className="px-4 py-2">{name}</td>
                        <td className="px-4 py-2">{qty}</td>
                        <td className="px-4 py-2">{formatCurrency(unitPrice)}</td>
                        <td className="px-4 py-2">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-400" colSpan={4}>
                      لا توجد عناصر مرتبطة بهذه الفاتورة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaleRow({
  invoice,
  onView,
  onReturn,
}: {
  invoice: POSInvoice;
  onView?: (id: number) => void;
  onReturn?: (invoice: POSInvoice) => void;
}) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      
      <td className="px-5 py-3 text-sm font-semibold text-slate-200">#{String(invoice.id).padStart(5, "0")}</td>
      <td className="px-5 py-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-white">
            {invoice.customer_name || "عميل نقدي"}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(invoice.sale_date).toLocaleString("ar-SA")}
          </span>
        </div>
      </td>
      <td className="px-5 py-3 text-sm text-slate-100">{formatCurrency(invoice.total)}</td>
      <td className="px-5 py-3">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass(invoice.status)}`}>
          {invoice.status === "posted" ? "مثبت" : invoice.status === "draft" ? "مسودة" : invoice.status === "void" ? "ملغاة" : invoice.status === "returned" ? "مرتجعة" : invoice.status}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-right">
        <div className="flex items-center justify-end gap-2">
          {invoice.status !== "returned" && onReturn && (
            <button
              className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/40 hover:bg-amber-500/20"
              onClick={() => onReturn(invoice)}
            >
              تسجيل مرتجع سريع
            </button>
          )}
          <button
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-300/30 hover:bg-sky-500/20"
            onClick={() => onView?.(invoice.id)}
          >
            عرض الفاتورة الكاملة
          </button>
        </div>
      </td>
    </tr>
  );
}

function PurchaseRow({
  purchase,
  onView,
}: {
  purchase: PurchaseInvoiceSummary;
  onView?: (id: number | string) => void;
}) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-3 text-sm font-semibold text-slate-200">PO-{String(purchase.id).padStart(5, "0")}</td>
      <td className="px-5 py-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-white">{purchase.supplier_name || "مورد غير معروف"}</span>
          <span className="text-xs text-slate-400">
            {purchase.order_date ? new Date(purchase.order_date).toLocaleDateString("ar-SA") : "—"}
          </span>
        </div>
      </td>
      <td className="px-5 py-3 text-sm text-slate-100">{formatCurrency(purchase.total_amount)}</td>
      <td className="px-5 py-3">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass(purchase.status)}`}>
          {purchase.status}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-right">
        <button
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/30 hover:bg-emerald-500/20"
          onClick={() => onView?.(purchase.id)}
        >
          عرض فاتورة المورد
        </button>
      </td>
    </tr>
  );
}

export default function POSInvoices({
  onViewSaleReceipt,
  onViewPurchaseReceipt,
}: {
  onViewSaleReceipt?: (id: number) => void;
  onViewPurchaseReceipt?: (id: number | string) => void;
}) {
  const [source, setSource] = useState<InvoiceSource>("sales");
  const [sales, setSales] = useState<POSInvoice[]>([]);
  const [purchaseSummaries, setPurchaseSummaries] = useState<PurchaseInvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saleModalLoading, setSaleModalLoading] = useState(false);
  const [purchaseModalLoading, setPurchaseModalLoading] = useState(false);
  const [saleReceipt, setSaleReceipt] = useState<POSReceipt | null>(null);
  const [isSaleModalOpen, setSaleModalOpen] = useState(false);
  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseInvoiceResponse | null>(null);
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesList, purchaseList] = await Promise.all([listSales(), listPurchaseSummaries()]);

      setSales(salesList);
      setPurchaseSummaries(
        purchaseList.map((purchase) => ({
          id: purchase.id,
          supplier_name:
            purchase.supplier_name ||
            purchase.items?.[0]?.name ||
            purchase.items?.[0]?.medicine_name ||
            "مورد غير معروف",
          order_date: purchase.order_date ?? null,
          total_amount: Number(purchase.total_amount || 0),
          status: purchase.status || "—",
        }))
      );
    } catch (err) {
      console.error("Failed to load invoices", err);
      setError("تعذر تحميل الفواتير. تأكد من الاتصال وحاول مرة أخرى.");
      toastRef.current?.error?.("فشل في تحميل الفواتير", "حدث خطأ عند الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const returnSales = useMemo(() => sales.filter((invoice) => invoice.status === "returned"), [sales]);

  const activeRows = useMemo(() => {
    switch (source) {
      case "sales":
        return sales.length;
      case "returns":
        return returnSales.length;
      case "purchases":
      default:
        return purchaseSummaries.length;
    }
  }, [source, sales.length, purchaseSummaries.length, returnSales.length]);

  const handleViewSale = async (id: number) => {
    if (onViewSaleReceipt) {
      onViewSaleReceipt(id);
      return;
    }
    setSaleModalLoading(true);
    try {
      const receipt = await fetchSaleReceipt(id);
      setSaleReceipt(receipt);
      setSaleModalOpen(true);
    } catch (err) {
      console.error("Failed to load sale receipt", err);
      toast.error("تعذر تحميل تفاصيل الفاتورة");
    } finally {
      setSaleModalLoading(false);
    }
  };

  const fetchSaleReceipt = useCallback(async (id: number): Promise<POSReceipt> => {
    const data = await getSaleById(id);
    return {
      id: data.id ?? data.invoice?.id ?? id,
      invoice: data.invoice,
      items: data.items || [],
      payments: data.payments || [],
    };
  }, []);

  const handleViewPurchase = async (id: number | string) => {
    if (onViewPurchaseReceipt) {
      onViewPurchaseReceipt(id);
      return;
    }
    setPurchaseModalLoading(true);
    try {
      const detail = await getPurchaseInvoiceById(id);
      setPurchaseDetail(detail);
      setPurchaseModalOpen(true);
    } catch (err) {
      console.error("Failed to load purchase invoice", err);
      toast.error("تعذر تحميل فاتورة المورد");
    } finally {
      setPurchaseModalLoading(false);
    }
  };

  const handleOpenReturnModal = useCallback(() => {
    if (!saleReceipt) {
      toast.error("يرجى تحميل تفاصيل الفاتورة قبل تسجيل المرتجع");
      return;
    }
    setReturnModalOpen(true);
  }, [saleReceipt, toast]);

  const handleQuickReturn = useCallback(
    async (invoice: POSInvoice) => {
      if (invoice.status === "returned") return;
      setSaleModalLoading(true);
      try {
        const receipt = await fetchSaleReceipt(invoice.id);
        setSaleReceipt(receipt);
        setReturnModalOpen(true);
      } catch (error) {
        console.error("Failed to load sale for quick return", error);
        toast.error("تعذر تحميل الفاتورة للمرتجع");
      } finally {
        setSaleModalLoading(false);
      }
    },
    [fetchSaleReceipt, toast]
  );

  const handleSubmitReturn = useCallback(
    async (itemsToReturn: { sale_item_id: number; medicine_id: number; return_qty: number; note?: string }[], note?: string) => {
      if (!saleReceipt) return;
      const payloadItems: ReturnSaleItemPayload[] = itemsToReturn.map((item) => ({
        sale_item_id: item.sale_item_id,
        medicine_id: item.medicine_id,
        qty: item.return_qty,
        note: item.note,
      }));

      try {
        setReturnSubmitting(true);
        await returnSale(saleReceipt.invoice.id, {
          items: payloadItems,
          note,
        });
        toast.success("تم تسجيل المرتجع بنجاح");
        setReturnModalOpen(false);
        setSaleModalOpen(false);
        setSaleReceipt(null);
        await loadInvoices();
      } catch (error: any) {
        console.error("Failed to return sale", error);
        const message = error?.response?.data?.error || "تعذر تسجيل المرتجع";
        toast.error(message);
      } finally {
        setReturnSubmitting(false);
      }
    },
    [saleReceipt, toast, loadInvoices]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-slate-400">لوحة التحكم / نقطة البيع</p>
          <h1 className="text-3xl font-semibold">سجل الفواتير</h1>
          <p className="text-sm text-slate-300">
            استعرض فواتير البيع السريعة أو مشتريات الموردين مع إمكانية فتح الفاتورة الكاملة.
          </p>
        </header>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl">
          <nav className="flex flex-wrap gap-3">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                source === "sales"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
              onClick={() => setSource("sales")}
            >
              فواتير البيع ({sales.length})
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                source === "purchases"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
              onClick={() => setSource("purchases")}
            >
              فواتير الموردين ({purchaseSummaries.length})
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                source === "returns"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
              onClick={() => setSource("returns")}
            >
              المرتجعات ({returnSales.length})
            </button>
          </nav>
          <div className="text-sm text-slate-300">
            يعرض القائمة {source === "sales" ? "أحدث فواتير نقاط البيع" : "أحدث فواتير الشراء"}.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold">
                {source === "sales" ? "فواتير البيع" : "فواتير الموردين"}
              </h3>
              <p className="text-xs text-slate-300">
                {activeRows > 0
                  ? `إجمالي ${source === "returns" ? "الفواتير المرتجعة" : "الفواتير المعروضة"}: ${activeRows}`
                  : source === "returns"
                  ? "لا توجد فواتير مرتجعة حالياً."
                  : "لا توجد فواتير مسجلة حتى الآن."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {saleModalLoading && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 text-white">
                <div className="rounded-2xl bg-slate-900 px-6 py-4 shadow-xl">جاري تحميل الفاتورة...</div>
              </div>
            )}
            {saleReceipt && isSaleModalOpen && (
              <POSReceiptModal
                isOpen={isSaleModalOpen}
                onClose={() => {
                  setSaleModalOpen(false);
                  setSaleReceipt(null);
                }}
                invoice={saleReceipt.invoice}
                items={saleReceipt.items}
                payments={saleReceipt.payments}
                onReturnSale={handleOpenReturnModal}
              />
            )}
            {purchaseModalLoading && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 text-white">
                <div className="rounded-2xl bg-slate-900 px-6 py-4 shadow-xl">جاري تحميل فاتورة المورد...</div>
              </div>
            )}
            {purchaseDetail && isPurchaseModalOpen && (
              <PurchaseInvoiceModal
                detail={purchaseDetail}
                onClose={() => {
                  setPurchaseModalOpen(false);
                  setPurchaseDetail(null);
                }}
              />
            )}
            {saleReceipt && (
              <POSReturnModal
                isOpen={isReturnModalOpen}
                receipt={saleReceipt}
                submitting={returnSubmitting}
                onClose={() => setReturnModalOpen(false)}
                onSubmit={async (items, note) =>
                  handleSubmitReturn(
                    items.map((item) => ({
                      sale_item_id: item.sale_item_id,
                      medicine_id: item.medicine_id,
                      return_qty: item.return_qty,
                      note: item.note,
                    })),
                    note
                  )
                }
              />
            )}
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-16 text-slate-300">
                <span className="text-3xl animate-spin">⏳</span>
                <p>جاري تحميل الفواتير...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-16 text-rose-200">
                <span className="text-4xl">⚠️</span>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/5 text-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {source === "sales" || source === "returns" ? "رقم الفاتورة" : "رقم أمر الشراء"}
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {source === "sales" || source === "returns" ? "العميل" : "المورد"}
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        الإجمالي
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-100">
                    {source === "sales"
                      ? sales.map((invoice) => (
                          <SaleRow
                            key={`sale-${invoice.id}`}
                            invoice={invoice}
                            onView={handleViewSale}
                            onReturn={handleQuickReturn}
                          />
                        ))
                      : source === "returns"
                      ? returnSales.map((invoice) => (
                          <SaleRow
                            key={`return-${invoice.id}`}
                            invoice={invoice}
                            onView={handleViewSale}
                            onReturn={handleQuickReturn}
                          />
                        ))
                      : purchaseSummaries.map((purchase) => (
                          <PurchaseRow
                            key={`purchase-${purchase.id}`}
                            purchase={purchase}
                            onView={handleViewPurchase}
                          />
                        ))}
                  </tbody>
                </table>

                {activeRows === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                    <span className="text-4xl">📄</span>
                    <p>
                      {source === "returns"
                        ? "لا توجد فواتير مرتجعة لعرضها حالياً."
                        : "لا توجد سجلات لعرضها في هذا القسم بعد."}
                    </p>
                    <p className="text-xs text-slate-500">
                      {source === "returns"
                        ? "عند تسجيل مرتجعات جديدة ستظهر هنا مع إمكانية مراجعة التفاصيل."
                        : "عند إنشاء فواتير جديدة ستظهر هنا مع إمكانية فتح تفاصيلها الكاملة."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}