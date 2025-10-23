// src/components/pharmacist/pos/POSReceiptModal.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../ui/Button";
import { 
  FiPrinter, 
  FiDownload, 
  FiX, 
  FiCheck, 
  FiDollarSign, 
  FiArrowUp, 
  FiArrowDown 
} from "react-icons/fi";
import type { POSInvoice, POSReceiptItem, POSPayment } from "./types";
import { formatCurrency } from "../../../utils/currency";
import "./style/POSReceiptModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: POSInvoice;
  items: POSReceiptItem[];
  payments: POSPayment[];
  onPrint?: () => void;
  onSave?: () => void;
}

export default function POSReceiptModal({ isOpen, onClose, invoice, items, payments, onPrint, onSave }: Props) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    calculateProfitLoss();
  }, [items, invoice]);

  const calculateProfitLoss = () => {
    let totalCostAmount = 0;
    let totalProfitAmount = 0;

    items.forEach(item => {
      const unitCost = item.unit_price * 0.7;
      const itemProfit = (item.unit_price - unitCost) * item.qty;
      totalCostAmount += unitCost * item.qty;
      totalProfitAmount += itemProfit;
    });

    setTotalCost(totalCostAmount);
    setTotalProfit(totalProfitAmount);
    setProfitMargin(totalCostAmount > 0 ? (totalProfitAmount / totalCostAmount) * 100 : 0);
  };

  const handleCompleteSale = () => {
    setIsCompleted(true);
    onSave?.();
  };

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  if (!isOpen) return null;

  return (
    <div className="pos-receipt-modal-overlay">
      <div className="pos-receipt-modal-content">
        {/* رأس الفاتورة */}
        <div className="pos-receipt-modal-header">
          <div className="pos-receipt-modal-title-section">
            <h3 className="pos-receipt-modal-title">فاتورة البيع</h3>
            <span className="pos-receipt-modal-invoice-number">رقم الفاتورة: #{String(invoice.id).padStart(6, '0')}</span>
          </div>
          <div className="pos-receipt-modal-status">
            {isCompleted ? (
              <div className="status-completed">
                <FiCheck className="status-icon" />
                <span>تم إتمام البيع</span>
              </div>
            ) : (
              <div className="status-pending">
                <FiDollarSign className="status-icon" />
                <span>قيد المراجعة</span>
              </div>
            )}
          </div>
        </div>

        {/* معلومات العميل والتاريخ */}
        <div className="pos-receipt-modal-info-section">
          <div className="info-row">
            <span className="info-label">العميل:</span>
            <span className="info-value">{invoice.customer_name || "عميل مجهول"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">التاريخ:</span>
            <span className="info-value">{new Date(invoice.sale_date).toLocaleString("ar-SA")}</span>
          </div>
          <div className="info-row">
            <span className="info-label">الحالة:</span>
            <span className={`info-value status-${invoice.status}`}>
              {invoice.status === 'posted' ? 'مرحل' :
               invoice.status === 'draft' ? 'مسودة' :
               invoice.status === 'void' ? 'ملغي' : 'مرتجع'}
            </span>
          </div>
        </div>

        {/* جدول العناصر المباعة */}
        <div className="pos-receipt-modal-items-section">
          <h4 className="section-title">العناصر المباعة</h4>
          <div className="receipt-items-table">
            <div className="table-header">
              <span className="col-name">اسم العنصر</span>
              <span className="col-qty">الكمية</span>
              <span className="col-price">سعر الوحدة</span>
              <span className="col-total">الإجمالي</span>
            </div>
            <div className="table-body">
              {items.map((item, i) => (
                <div key={i} className="table-row">
                  <span className="col-name" title={item.medicine_name}>
                    {item.medicine_name || item.name}
                  </span>
                  <span className="col-qty">{item.qty}</span>
                  <span className="col-price">{formatCurrency(item.unit_price)}</span>
                  <span className="col-total">{formatCurrency(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* قسم المجاميع */}
        <div className="pos-receipt-modal-totals-section">
          <div className="totals-grid">
            <div className="total-row">
              <span className="total-label">إجمالي التكلفة:</span>
              <span className="total-amount cost">{formatCurrency(totalCost)}</span>
            </div>
            <div className="total-row profit-row">
              <span className="total-label">
                إجمالي الأرباح:
                <div className="profit-margin">
                  {profitMargin >= 0 ? (
                    <FiArrowUp className="margin-icon profit" />
                  ) : (
                    <FiArrowDown className="margin-icon loss" />
                  )}
                  <span className={profitMargin >= 0 ? 'profit' : 'loss'}>
                    {Math.abs(profitMargin).toFixed(1)}%
                  </span>
                </div>
              </span>
              <span className={`total-amount ${profitMargin >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(totalProfit)}
              </span>
            </div>
            <div className="total-row main-total">
              <span className="total-label">إجمالي الفاتورة:</span>
              <span className="total-amount main">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* قسم الدفعات */}
        <div className="pos-receipt-modal-payments-section">
          <h4 className="section-title">الدفعات</h4>
          <div className="payments-list">
            {payments.length > 0 ? (
              payments.map((payment, i) => (
                <div key={i} className="payment-item">
                  <span className="payment-method">{payment.method_name}</span>
                  <span className={`payment-amount ${payment.is_change ? 'change' : ''}`}>
                    {formatCurrency(payment.amount)}
                    {payment.is_change && <span className="change-label">(متبقي)</span>}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-payments">لا توجد دفعات مسجلة</div>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="pos-receipt-modal-actions">
          {!isCompleted ? (
            <>
              <Button
                onClick={handleCompleteSale}
                variant="success"
                className="complete-sale-button"
              >
                <FiCheck /> إتمام البيع
              </Button>
              <Button onClick={onClose} variant="outline" className="cancel-button">
                <FiX /> إلغاء
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handlePrint} variant="primary" className="print-button">
                <FiPrinter /> طباعة الفاتورة
              </Button>
              <Button onClick={onClose} variant="outline" className="close-button">
                <FiDownload /> إغلاق
              </Button>
            </>
          )}
        </div>

        {/* ملاحظات إضافية */}
        {invoice.notes && (
          <div className="pos-receipt-modal-notes">
            <h4 className="notes-title">ملاحظات:</h4>
            <p className="notes-content">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}