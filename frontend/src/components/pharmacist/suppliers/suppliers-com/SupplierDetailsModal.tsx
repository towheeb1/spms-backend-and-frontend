// src/components/suppliers/components/SupplierDetailsModal.tsx
import { useState, useEffect } from "react";
import { SupplierPurchaseGroup, Purchase } from "../types";

interface SupplierDetailsModalProps {
  supplier: SupplierPurchaseGroup;
  onClose: () => void;
  onPayment: (id: number, amount: number) => Promise<void>;
  onReceive?: (purchase: Purchase) => void;
  initialOpenOrderId?: string | number | null;
}

function formatCurrency(amount: number, currency?: string | null) {
  const fallbackSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "SAR" ? "﷼" : "ر.ي";
  try {
    return `${new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${fallbackSymbol}`;
  } catch {
    return `${amount.toFixed(2)} ${fallbackSymbol}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "غير محدد";
  try {
    return new Date(value).toLocaleDateString("ar-SA");
  } catch {
    return value;
  }
}

function getStatusMeta(status?: string) {
  switch (status) {
    case "completed":
      return { label: "مكتمل", color: "bg-green-500/20 text-green-300" };
    case "pending":
      return { label: "قيد الانتظار", color: "bg-yellow-500/20 text-yellow-300" };
    case "cancelled":
      return { label: "ملغى", color: "bg-red-500/20 text-red-300" };
    case "received":
      return { label: "تم الاستلام", color: "bg-blue-500/20 text-blue-300" };
    default:
      return { label: "قيد التنفيذ", color: "bg-blue-500/20 text-blue-300" };
  }
}

interface OrderCardProps {
  purchase: Purchase;
  expanded: boolean;
  onToggle: () => void;
  onPayment: (id: number, amount: number) => Promise<void>;
  onReceive?: (purchase: Purchase) => void;
  openPayment?: boolean;
}

function OrderCard({ purchase, expanded, onToggle, onPayment, onReceive, openPayment }: OrderCardProps) {
  const { label: statusLabel, color: statusColor } = getStatusMeta(purchase?.status);
  const amountReceived = Number(purchase?.amount_received || 0);
  const amountRemaining = Number(purchase?.amount_remaining || 0);
  const totalAmount = Number(purchase?.total_amount || 0);
  const currency = purchase?.currency || "YER";
  const totalQuantity = Number(purchase?.total_quantity || 0);
  const nearestExpiry = purchase?.nearest_expiry ? formatDate(purchase.nearest_expiry) : "غير محدد";
  const items = purchase?.items || [];

  const [showPayment, setShowPayment] = useState(Boolean(openPayment));
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    setShowPayment(Boolean(openPayment));
  }, [openPayment]);

  const handlePayment = async () => {
    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0 || amt > amountRemaining) {
      alert("مبلغ غير صحيح");
      return;
    }
    await onPayment(Number(purchase.id), amt);
    setShowPayment(false);
    setPaymentAmount("");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-semibold">طلب #{purchase.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>{statusLabel}</span>
            {purchase.order_date && <span className="text-xs opacity-70">بتاريخ {formatDate(purchase.order_date)}</span>}
          </div>
          <div className="text-sm opacity-80">شروط الدفع: {purchase.payment_terms || "غير محددة"}</div>
          {purchase.supplier_reference && <div className="text-xs opacity-60">مرجع المورد: {purchase.supplier_reference}</div>}
        </div>
        <div className="text-right space-y-1">
          <div className="text-lg font-semibold">{formatCurrency(totalAmount, currency)}</div>
          <div className="text-sm opacity-70">{purchase.items_count || items.length} عنصر</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white/8 px-3 py-2 text-sm">
          <div className="opacity-70 mb-1">إجمالي الكمية المشتراة</div>
          <div className="text-base font-semibold">{totalQuantity}</div>
        </div>
        <div className="rounded-xl bg-white/8 px-3 py-2 text-sm">
          <div className="opacity-70 mb-1">أقرب تاريخ انتهاء</div>
          <div className="text-base font-semibold">{nearestExpiry}</div>
        </div>
        <div className="rounded-xl bg-white/8 px-3 py-2 text-sm">
          <div className="opacity-70 mb-1">المبلغ المسلم</div>
          <div className="text-base font-semibold">{formatCurrency(amountReceived, currency)}</div>
        </div>
        <div className="rounded-xl bg-white/8 px-3 py-2 text-sm">
          <div className="opacity-70 mb-1">المبلغ المتبقي</div>
          <div className="text-base font-semibold">{formatCurrency(amountRemaining, currency)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="text-xs opacity-70">تاريخ التسليم المتوقع: {formatDate(purchase.expected_date)}</div>
        <div className="flex gap-2">
          {(purchase.status === 'ordered' || (purchase.remaining_quantity && purchase.remaining_quantity > 0)) && onReceive && (
            <button
              type="button"
              className="rounded-lg bg-green-600/90 px-3 py-1.5 text-sm transition-colors hover:bg-green-600"
              onClick={() => onReceive(purchase)}
            >
              استلام البضاعة
            </button>
          )}
          {amountRemaining > 0 && (
            <button
              type="button"
              className="rounded-lg bg-blue-600/90 px-3 py-1.5 text-sm transition-colors hover:bg-blue-600"
              onClick={() => setShowPayment(true)}
            >
              سداد دفعة
            </button>
          )}
          <button
            type="button"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
            onClick={onToggle}
          >
            {expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
          </button>
        </div>
      </div>

      {showPayment && (
        <div className="mt-3 rounded-xl bg-white/5 p-4">
          <div className="flex gap-2">
            <input
              type="number"
              className="input flex-1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="أدخل المبلغ المسدد"
              min="0"
              max={amountRemaining}
            />
            <button
              className="rounded-lg bg-green-600/90 px-3 py-2 text-sm transition-colors hover:bg-green-600"
              onClick={handlePayment}
            >
              تأكيد
            </button>
            <button
              className="rounded-lg bg-red-600/90 px-3 py-2 text-sm transition-colors hover:bg-red-600"
              onClick={() => setShowPayment(false)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-3 rounded-xl bg-white/5 p-4 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="opacity-70">الحالة</span>
              <span>{statusLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">الشحن</span>
              <span>{purchase.shipping_terms || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">ملاحظات</span>
              <span>{purchase.notes || "-"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10">
            <div className="grid grid-cols-5 gap-2 border-b border-white/10 px-3 py-2 text-xs opacity-70">
              <span className="col-span-2">العنصر</span>
              <span>الكمية</span>
              <span>سعر الوحدة</span>
              <span>الإجمالي</span>
            </div>
            <div className="divide-y divide-white/10">
              {items.length > 0 ? (
                items.map((item) => {
                  const qty = Number(item.quantity || 0);
                  const unitPrice = Number(item.unit_price ?? item.price ?? 0);
                  const lineTotal = Number(item.line_total ?? item.subtotal ?? qty * unitPrice);
                  return (
                    <div key={`${item.id ?? item.name}-${item.batch_no ?? ""}`} className="grid grid-cols-5 gap-2 px-3 py-2 text-xs sm:text-sm">
                      <div className="col-span-2 space-y-1">
                        <div className="font-medium">{item.name || "منتج"}</div>
                        <div className="text-[11px] opacity-60">
                          {item.barcode ? `باركود: ${item.barcode}` : null}
                          {item.batch_no ? `، دفعة: ${item.batch_no}` : null}
                          {item.expiry_date ? `، انتهاء: ${formatDate(item.expiry_date)}` : null}
                        </div>
                      </div>
                      <div>{`${qty} ${item.unit || ""}`.trim()}</div>
                      <div>{formatCurrency(unitPrice, currency)}</div>
                      <div>{formatCurrency(lineTotal, currency)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs opacity-60">لا توجد عناصر مسجلة لهذا الطلب</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierDetailsModal({ supplier, onClose, onPayment, onReceive, initialOpenOrderId = null }: SupplierDetailsModalProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(null);

  const { total_spent, total_received, total_due, purchases } = supplier;
  const baseCurrency = purchases[0]?.currency || "YER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-[#111827] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold">تقرير مفصل للمورد: {supplier.supplier_name}</h3>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">×</button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/8 p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(total_spent, baseCurrency)}</div>
            <div className="text-sm opacity-70">إجمالي الإنفاق</div>
          </div>
          <div className="rounded-xl bg-white/8 p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(total_received, baseCurrency)}</div>
            <div className="text-sm opacity-70">المبلغ المسلم</div>
          </div>
          <div className="rounded-xl bg-white/8 p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(total_due, baseCurrency)}</div>
            <div className="text-sm opacity-70">المتبقي</div>
          </div>
        </div>

        <div className="space-y-4">
          {purchases.map((order) => (
            <OrderCard
              key={order.id}
              purchase={order}
              expanded={expandedOrderId === order.id}
              onToggle={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
              onPayment={onPayment}
              onReceive={onReceive}
              openPayment={initialOpenOrderId !== null && String(initialOpenOrderId) === String(order.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
