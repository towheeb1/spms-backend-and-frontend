// src/components/suppliers/components/OrderCard.tsx
import { useState } from "react";
import { Purchase } from "../types";
import '../style/OrderCard.css';

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
      return { label: "مكتمل", color: "order-card-status-completed" };
    case "pending":
      return { label: "قيد الانتظار", color: "order-card-status-pending" };
    case "cancelled":
      return { label: "ملغى", color: "order-card-status-cancelled" };
    case "received":
      return { label: "تم الاستلام", color: "order-card-status-received" };
    default:
      return { label: "قيد التنفيذ", color: "order-card-status-default" };
  }
}

interface OrderCardProps {
  purchase: Purchase;
  expanded: boolean;
  onToggle: () => void;
  onPayment: (id: number, amount: number) => Promise<void>;
}

export default function OrderCard({ purchase, expanded, onToggle, onPayment }: OrderCardProps) {
  const { label: statusLabel, color: statusColor } = getStatusMeta(purchase.status);
  const amountReceived = Number(purchase.amount_received || 0);
  const amountRemaining = Number(purchase.amount_remaining || 0);
  const totalAmount = Number(purchase.total_amount || 0);
  const currency = purchase.currency || "YER";
  const totalQuantity = Number(purchase.total_quantity || 0);
  const nearestExpiry = purchase.nearest_expiry ? formatDate(purchase.nearest_expiry) : "غير محدد";
  const items = purchase.items || [];

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

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
    <div className="order-card-container">
      <div className="order-card-header">
        <div className="order-card-info-section">
          <div className="order-card-title-row">
            <span className="order-card-title">طلب #{purchase.id}</span>
            <span className={`order-card-status-badge ${statusColor}`}>{statusLabel}</span>
            {purchase.order_date && <span className="order-card-date">بتاريخ {formatDate(purchase.order_date)}</span>}
          </div>
          <div className="order-card-details">شروط الدفع: {purchase.payment_terms || "غير محددة"}</div>
          {purchase.supplier_reference && <div className="order-card-supplier-ref">مرجع المورد: {purchase.supplier_reference}</div>}
        </div>
        <div className="order-card-amount-section">
          <div className="order-card-total-amount">{formatCurrency(totalAmount, currency)}</div>
          <div className="order-card-items-count">{purchase.items_count || items.length} عنصر</div>
        </div>
      </div>

      <div className="order-card-summary-grid">
        <div className="order-card-summary-item">
          <div className="order-card-summary-label">إجمالي الكمية المشتراة</div>
          <div className="order-card-summary-value">{totalQuantity}</div>
        </div>
        <div className="order-card-summary-item">
          <div className="order-card-summary-label">أقرب تاريخ انتهاء</div>
          <div className="order-card-summary-value">{nearestExpiry}</div>
        </div>
        <div className="order-card-summary-item">
          <div className="order-card-summary-label">المبلغ المسلم</div>
          <div className="order-card-summary-value">{formatCurrency(amountReceived, currency)}</div>
        </div>
        <div className="order-card-summary-item">
          <div className="order-card-summary-label">المبلغ المتبقي</div>
          <div className="order-card-summary-value">{formatCurrency(amountRemaining, currency)}</div>
        </div>
      </div>

      <div className="order-card-actions-section">
        <div className="order-card-date-info">تاريخ التسليم المتوقع: {formatDate(purchase.expected_date)}</div>
        <div className="order-card-actions">
          {amountRemaining > 0 && (
            <button
              type="button"
              className="order-card-action-button order-card-button-payment"
              onClick={() => setShowPayment(true)}
            >
              سداد دفعة
            </button>
          )}
          <button
            type="button"
            className="order-card-action-button order-card-button-details"
            onClick={onToggle}
          >
            {expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
          </button>
        </div>
      </div>

      {showPayment && (
        <div className="order-card-payment-modal">
          <div className="order-card-payment-form">
            <input
              type="number"
              className="order-card-payment-input"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="أدخل المبلغ المسدد"
              min="0"
              max={amountRemaining}
            />
            <button
              className="order-card-payment-button-confirm"
              onClick={handlePayment}
            >
              تأكيد
            </button>
            <button
              className="order-card-payment-button-cancel"
              onClick={() => setShowPayment(false)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="order-card-details-section">
          <div className="order-card-details-grid">
            <div className="order-card-detail-row">
              <span className="order-card-detail-label">الحالة</span>
              <span className="order-card-detail-value">{statusLabel}</span>
            </div>
            <div className="order-card-detail-row">
              <span className="order-card-detail-label">الشحن</span>
              <span className="order-card-detail-value">{purchase.shipping_terms || "غير محدد"}</span>
            </div>
            <div className="order-card-detail-row">
              <span className="order-card-detail-label">ملاحظات</span>
              <span className="order-card-detail-value">{purchase.notes || "-"}</span>
            </div>
          </div>

          <div className="order-card-items-table">
            <div className="order-card-items-header">
              <span className="order-card-items-header-item order-card-items-header-item-wide">العنصر</span>
              <span className="order-card-items-header-item">الكمية</span>
              <span className="order-card-items-header-item">سعر الوحدة</span>
              <span className="order-card-items-header-item">الإجمالي</span>
            </div>
            <div className="order-card-items-body">
              {items.length > 0 ? (
                items.map((item) => {
                  const qty = Number(item.quantity || 0);
                  const unitPrice = Number(item.unit_price ?? item.price ?? 0);
                  const lineTotal = Number(item.line_total ?? item.subtotal ?? qty * unitPrice);
                  return (
                    <div key={`${item.id ?? item.name}-${item.batch_no ?? ""}`} className="order-card-item-row">
                      <div className="order-card-item-info">
                        <div className="order-card-item-name">{item.name || "منتج"}</div>
                        <div className="order-card-item-details">
                          {item.barcode ? `باركود: ${item.barcode}` : null}
                          {item.batch_no ? `، دفعة: ${item.batch_no}` : null}
                          {item.expiry_date ? `، انتهاء: ${formatDate(item.expiry_date)}` : null}
                        </div>
                      </div>
                      <div className="order-card-item-quantity">{`${qty} ${item.unit || ""}`.trim()}</div>
                      <div className="order-card-item-price">{formatCurrency(unitPrice, currency)}</div>
                      <div className="order-card-item-total">{formatCurrency(lineTotal, currency)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="order-card-empty-items">لا توجد عناصر مسجلة لهذا الطلب</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
