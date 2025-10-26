import React, { useMemo, useState } from "react";
import type { POSReceipt, POSReceiptItem } from "./types";
import { formatCurrency } from "../../../utils/currency";
import "./style/POSReturnModal.css";

interface ReturnItemState {
  sale_item_id: number;
  medicine_id: number;
  name: string;
  sold_qty: number;
  return_qty: number;
  unit_price: number;
  note?: string;
}

interface Props {
  isOpen: boolean;
  receipt: POSReceipt | null;
  onClose: () => void;
  onSubmit: (items: ReturnItemState[], note?: string) => Promise<void> | void;
  submitting?: boolean;
}

const MAX_COLUMNS = 4;

export default function POSReturnModal({ isOpen, receipt, onClose, onSubmit, submitting }: Props) {
  const [items, setItems] = useState<ReturnItemState[]>([]);
  const [globalNote, setGlobalNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useMemo(() => {
    if (!isOpen || !receipt) return;
    setItems(
      receipt.items.map((item: POSReceiptItem) => ({
        sale_item_id: item.id,
        medicine_id: item.medicine_id,
        name: item.medicine_name || item.name || `صنف ${item.id}`,
        sold_qty: Number(item.qty || 0),
        return_qty: 0,
        unit_price: Number(item.unit_price || 0),
      }))
    );
    setGlobalNote("");
    setFormError(null);
  }, [isOpen, receipt]);

  if (!isOpen || !receipt) return null;

  const handleQtyChange = (saleItemId: number, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sale_item_id === saleItemId
          ? {
              ...item,
              return_qty: Math.min(Math.max(Number(value) || 0, 0), item.sold_qty),
            }
          : item
      )
    );
  };

  const handleNoteChange = (saleItemId: number, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sale_item_id === saleItemId
          ? {
              ...item,
              note: value,
            }
          : item
      )
    );
  };

  const totalReturn = useMemo(
    () =>
      items.reduce((sum, item) => {
        return sum + item.return_qty * item.unit_price;
      }, 0),
    [items]
  );

  const handleSubmit = async () => {
    const itemsToReturn = items.filter((item) => item.return_qty > 0);
    if (!itemsToReturn.length) {
      setFormError("يرجى تحديد كمية مرتجعة واحدة على الأقل.");
      return;
    }

    try {
      setFormError(null);
      await onSubmit(itemsToReturn, globalNote.trim() || undefined);
      setItems([]);
      setGlobalNote("");
    } catch (error) {
      console.error("Failed to submit return", error);
      setFormError("تعذر إنشاء المرتجع. حاول مرة أخرى.");
    }
  };

  return (
    <div className="pos-return-modal-overlay">
      <div className="pos-return-modal-content">
        <div className="pos-return-modal-header">
          <div>
            <h3 className="pos-return-modal-title">تسجيل مرتجع للفاتورة #{String(receipt.invoice.id).padStart(5, "0")}</h3>
            <p className="pos-return-modal-subtitle">
              اختر الكميات التي ترغب في إرجاعها. المخزون سيتحدّث تلقائيًا بعد تأكيد العملية.
            </p>
          </div>
          <button className="pos-return-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pos-return-modal-body">
          <div className="pos-return-summary">
            <div>
              <span className="pos-return-summary-label">العميل:</span>
              <span className="pos-return-summary-value">
                {receipt.invoice.customer_name || "عميل نقدي"}
              </span>
            </div>
            <div>
              <span className="pos-return-summary-label">إجمالي الفاتورة:</span>
              <span className="pos-return-summary-value">
                {formatCurrency(receipt.invoice.total)}
              </span>
            </div>
            <div>
              <span className="pos-return-summary-label">القيمة المرتجعة:</span>
              <span className="pos-return-summary-value">
                {formatCurrency(totalReturn)}
              </span>
            </div>
          </div>

          {items.length ? (
            <div className="pos-return-items-grid">
              {items.map((item) => (
                <div key={item.sale_item_id} className="pos-return-item-card">
                  <div className="pos-return-item-header">
                    <div className="pos-return-item-name">{item.name}</div>
                    <div className="pos-return-item-sold">الكمية المباعة: {item.sold_qty}</div>
                  </div>
                  <div className="pos-return-item-row">
                    <label>الكمية المرتجعة</label>
                    <input
                      type="number"
                      min={0}
                      max={item.sold_qty}
                      value={item.return_qty}
                      onChange={(e) => handleQtyChange(item.sale_item_id, e.target.value)}
                    />
                  </div>
                  <div className="pos-return-item-row">
                    <label>ملاحظة</label>
                    <textarea
                      value={item.note || ""}
                      onChange={(e) => handleNoteChange(item.sale_item_id, e.target.value)}
                      placeholder="سبب الإرجاع أو ملاحظات إضافية"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pos-return-empty">لا توجد عناصر في هذه الفاتورة.</div>
          )}
        </div>

        <div className="pos-return-modal-footer">
          {formError && <div className="pos-return-error">{formError}</div>}
          <div className="pos-return-global-note">
            <label>ملاحظة عامة</label>
            <textarea
              value={globalNote}
              onChange={(e) => setGlobalNote(e.target.value)}
              placeholder="أدخل أي ملاحظات عامة للمرتجع..."
            />
          </div>
          <div className="pos-return-actions">
            <button className="pos-return-cancel" onClick={onClose}>
              إلغاء
            </button>
            <button
              className="pos-return-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "جارٍ التنفيذ..." : "تأكيد المرتجع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
