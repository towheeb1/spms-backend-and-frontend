// src/components/pharmacist/pos/POSReceiptModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPrinter,
  FiDownload,
  FiX,
  FiCheck,
  FiDollarSign,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { Button } from "../../ui/Button";
import type {
  POSInvoice,
  POSReceiptItem,
  POSPayment,
  PaymentMethod,
} from "./types";
import { formatCurrency } from "../../../utils/currency";
import "./style/POSReceiptModal.css";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  invoice: POSInvoice;
  items: POSReceiptItem[];
  payments: POSPayment[];
  paymentMethods?: PaymentMethod[];
  onPayment?: (
    methodId: number,
    amount: number,
    isChange: boolean
  ) => Promise<void> | void;
  onPrint?: () => void;
  onCompleteSale?: () => Promise<void> | void;
  onReturnSale?: (invoice: POSInvoice) => void;
  isCompletingSale?: boolean;
}

interface PharmacyInfo {
  name: string | null;
  legalName: string | null;
  address: string | null;
  phone: string | null;
  taxNumber: string | null;
  branchName: string | null;
  branchCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
}

const STATUS_LABEL: Record<POSInvoice["status"], string> = {
  posted: "مدفوعة",
  draft: "مسودة",
  void: "ملغاة",
  returned: "مرتجعة",
};

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default function POSReceiptModal({
  isOpen,
  onClose,
  invoice,
  items,
  payments,
  paymentMethods,
  onPayment,
  onPrint,
  onCompleteSale,
  onReturnSale,
  isCompletingSale,
}: Props) {
  const [pharmacyInfo, setPharmacyInfo] = useState<PharmacyInfo | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalCompleting, setInternalCompleting] = useState(false);
  const completingSale = isCompletingSale ?? internalCompleting;
  const defaultMethods = useMemo(
    () => [{ id: -1, name: "نقدي", is_cash: true, is_active: true }],
    []
  );
  const availableMethods = useMemo(
    () => (paymentMethods && paymentMethods.length ? paymentMethods : defaultMethods),
    [paymentMethods, defaultMethods]
  );
  const cashMethodId = availableMethods[0]?.id ?? -1;
  const canRecordPayments =
    Boolean(invoice?.id) && typeof onPayment === "function" && invoice.status !== "void";
  const receiptRef = useRef<HTMLDivElement>(null);
  const invoiceNumber = useMemo(
    () => `#${String(invoice?.id ?? 0).padStart(6, "0")}`,
    [invoice?.id]
  );
  const saleDateFormatted = useMemo(() => formatDateTime(invoice.sale_date), [invoice.sale_date]);

  useEffect(() => {
    if (!isOpen) return;
    setPharmacyInfo({
      name: null,
      legalName: null,
      address: null,
      phone: null,
      taxNumber: null,
      branchName: null,
      branchCode: null,
      customerName: invoice.customer_name ?? null,
      customerPhone: null,
    });
  }, [invoice.customer_name, isOpen]);

  useEffect(() => {
    setSelectedMethodId((prev) => prev ?? cashMethodId);
  }, [cashMethodId]);

  const paymentSummary = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        const amount = Number(payment.amount || 0);
        if (payment.is_change) {
          acc.change += amount;
        } else {
          acc.paid += amount;
        }
        return acc;
      },
      {
        paid: 0,
        change: 0,
        get netPaid() {
          const value = this.paid - this.change;
          return value > 0 ? value : 0;
        },
        get amountDue() {
          const due = invoice.total - this.netPaid;
          return due > 0 ? due : 0;
        },
        get totalReceived() {
          return this.paid + this.change;
        },
      }
    );
  }, [payments, invoice.total]);

  useEffect(() => {
    if (!isOpen) return;
    if (paymentSummary.amountDue > 0) {
      setPaymentAmount(paymentSummary.amountDue.toFixed(2));
    } else {
      setPaymentAmount("");
    }
    setFormError(null);
  }, [paymentSummary.amountDue, isOpen]);

  const expectedChange = useMemo(() => {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount)) return 0;
    const change = amount - paymentSummary.amountDue;
    return change > 0 ? Number(change.toFixed(2)) : 0;
  }, [paymentAmount, paymentSummary.amountDue]);

  const handleCompleteSale = async () => {
    if (paymentSummary.amountDue > 0) {
      setFormError("لا يمكن إتمام البيع قبل سداد كامل المبلغ.");
      return;
    }

    try {
      setInternalCompleting(true);
      setFormError(null);
      if (onCompleteSale) {
        await Promise.resolve(onCompleteSale());
      }
    } catch (error) {
      console.error("Failed to complete sale:", error);
      setFormError("تعذر إتمام البيع. حاول مرة أخرى.");
    } finally {
      setInternalCompleting(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) {
      window.print();
      onPrint?.();
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      window.print();
      onPrint?.();
      return;
    }

    const styles = Array.from(
      document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        'link[rel="stylesheet"], style'
      )
    )
      .map((element) => element.outerHTML)
      .join("\n");

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة البيع ${invoiceNumber}</title>
          ${styles}
          <style>
            body {
              background: #fff;
              color: #1e293b;
              margin: 0;
              padding: 32px;
              font-family: 'Tajawal', 'Cairo', 'Segoe UI', sans-serif;
            }
            .receipt-card {
              background: #fff !important;
              color: #1e293b !important;
              box-shadow: none !important;
              border: none !important;
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.outerHTML}
        </body>
      </html>`);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      onPrint?.();
    }, 300);
  };

  const handleSubmitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onPayment) return;

    if (paymentSummary.amountDue <= 0) {
      setFormError("تم سداد الفاتورة بالكامل.");
      return;
    }
    const methodId = selectedMethodId ?? cashMethodId;
    if (!paymentAmount.trim()) {
      setFormError("أدخل مبلغ الدفعة.");
      return;
    }
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("أدخل مبلغًا صالحًا.");
      return;
    }
    if (amount + 1e-2 < paymentSummary.amountDue) {
      setFormError("المبلغ المدفوع أقل من المبلغ المستحق.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const due = Number(paymentSummary.amountDue.toFixed(2));
      const change = Math.max(amount - due, 0);

      await Promise.resolve(onPayment(methodId, due, false));

      if (change > 0.009) {
        await Promise.resolve(
          onPayment(methodId, Number(change.toFixed(2)), true)
        );
      }

      setPaymentAmount("");
    } catch (error) {
      console.error("Failed to record payment:", error);
      setFormError("تعذر تسجيل الدفعة. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pos-receipt-modal-overlay">
      <div className="pos-receipt-modal-content">
        <div className="receipt-card" ref={receiptRef}>
          <header className="receipt-card__header">
            <div className="receipt-card__brand">
              <h3 className="receipt-card__title">
                {pharmacyInfo?.name ?? "فاتورة البيع"}
              </h3>
              {pharmacyInfo?.legalName &&
                pharmacyInfo.legalName !== pharmacyInfo.name && (
                  <span className="receipt-card__subtitle">
                    {pharmacyInfo.legalName}
                  </span>
                )}
              {pharmacyInfo?.address && (
                <span className="receipt-card__detail">
                  {pharmacyInfo.address}
                </span>
              )}
              {(pharmacyInfo?.phone || pharmacyInfo?.taxNumber) && (
                <div className="receipt-card__meta">
                  {pharmacyInfo.phone && (
                    <span>هاتف: {pharmacyInfo.phone}</span>
                  )}
                  {pharmacyInfo.taxNumber && (
                    <span>الرقم الضريبي: {pharmacyInfo.taxNumber}</span>
                  )}
                </div>
              )}
            </div>
            <div className="receipt-card__header-meta">
              <div>
                <span className="meta-label">رقم الفاتورة</span>
                <span className="meta-value">{invoiceNumber}</span>
              </div>
              <div>
                <span className="meta-label">تاريخ الفاتورة</span>
                <span className="meta-value">{saleDateFormatted}</span>
              </div>
              <div>
                <span className="meta-label">الحالة</span>
                <span className={`status-badge status-${invoice.status}`}>
                  {STATUS_LABEL[invoice.status] ?? invoice.status}
                </span>
              </div>
            </div>
          </header>

          <section className="receipt-card__info">
            <div>
              <span className="meta-label">العميل</span>
              <span className="meta-value">
                {pharmacyInfo?.customerName ||
                  invoice.customer_name ||
                  "عميل نقدي"}
              </span>
              {pharmacyInfo?.customerPhone && (
                <span className="meta-hint">
                  هاتف العميل: {pharmacyInfo.customerPhone}
                </span>
              )}
            </div>
            <div>
              <span className="meta-label">الفرع</span>
              <span className="meta-value">
                {pharmacyInfo?.branchName || "الرئيسي"}
              </span>
              {pharmacyInfo?.branchCode && (
                <span className="meta-hint">
                  كود الفرع: {pharmacyInfo.branchCode}
                </span>
              )}
            </div>
            <div>
              <span className="meta-label">رقم المسجل</span>
              <span className="meta-value">
                {invoice.register_id ?? "—"}
              </span>
              <span className="meta-hint">
                رقم الشفت: {invoice.shift_id ?? "—"}
              </span>
            </div>
          </section>

          <section className="receipt-card__table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الوحدة</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.id}-${item.medicine_id}`}>
                      <td title={item.medicine_name || item.name}>
                        {item.medicine_name || item.name}
                      </td>
                      <td>{item.unit_label || item.unit_type || "—"}</td>
                      <td>{item.qty}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="receipt-card__summary">
            <div className="summary-block">
              <span className="summary-label">إجمالي المبالغ المستلمة</span>
              <span className="summary-value summary-total">
                {formatCurrency(paymentSummary.totalReceived)}
              </span>
            </div>
            <div className="summary-block">
              <span className="summary-label">الصافي المطبق على الفاتورة</span>
              <span className="summary-value">
                {formatCurrency(paymentSummary.netPaid)}
              </span>
            </div>
            {paymentSummary.change > 0 && (
              <div className="summary-block summary-block--change">
                <span className="summary-label">الباقي للعميل</span>
                <span className="summary-value summary-change">
                  {formatCurrency(paymentSummary.change)}
                </span>
              </div>
            )}
            <div className="summary-block">
              <span className="summary-label">المتبقي للدفع</span>
              <span
                className={`summary-value ${
                  paymentSummary.amountDue > 0
                    ? "summary-due"
                    : "summary-settled"
                }`}
              >
                {formatCurrency(paymentSummary.amountDue)}
              </span>
            </div>
          </section>

          <section className="receipt-card__payments">
            <div className="payments-list">
              <h4 className="section-title">الدفعات المسجلة</h4>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="payment-row">
                    <div>
                      <span className="payment-method">
                        {payment.method_name}
                      </span>
                      <span className="payment-date">
                        {formatDateTime(payment.received_at)}
                      </span>
                    </div>
                    <div className="payment-amount">
                      {formatCurrency(payment.amount)}
                      {payment.is_change && (
                        <span className="payment-change">باقي</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-payments">لا توجد دفعات مسجلة</div>
              )}
            </div>

            <div className="payments-form">
              <h4 className="section-title">تسجيل دفعة جديدة</h4>
              {paymentSummary.amountDue <= 0 ? (
                <div className="all-settled">
                  تم سداد الفاتورة بالكامل، ولا يوجد مبلغ مستحق.
                  {paymentSummary.change > 0 && (
                    <div className="all-settled__hint">
                      يرجى إعادة {formatCurrency(paymentSummary.change)} للعميل.
                    </div>
                  )}
                </div>
              ) : (
                <form id="receipt-payment-form" onSubmit={handleSubmitPayment}>
                  <div className="cash-info">
                    <span className="methods-label">طريقة الدفع المتاحة: نقدي فقط</span>
                  </div>
                  <label className="form-field">
                    <span>المبلغ المدفوع نقداً</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) =>
                        setPaymentAmount(event.target.value)
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <div className="payment-hints">
                    <div>
                      <span>المتبقي الحالي:</span>
                      <strong>
                        {formatCurrency(paymentSummary.amountDue)}
                      </strong>
                    </div>
                    <div>
                      <span>الباقي المتوقع:</span>
                      <strong>{formatCurrency(expectedChange)}</strong>
                    </div>
                  </div>

                  {formError && <div className="form-error">{formError}</div>}

                </form>
              )}
            </div>
          </section>

          {invoice.notes && (
            <section className="receipt-card__notes">
              <h4 className="section-title">ملاحظات</h4>
              <p>{invoice.notes}</p>
            </section>
          )}

          <div className="receipt-card__actions">
            <Button
              type="submit"
              form="receipt-payment-form"
              variant="primary"
              className="record-payment-button"
              disabled={
                isSubmitting ||
                !canRecordPayments ||
                paymentSummary.amountDue <= 0
              }
            >
              {isSubmitting ? (
                "جاري تسجيل الدفعة..."
              ) : (
                <>
                  <FiDollarSign /> تسجيل الدفعة
                </>
              )}
            </Button>
            <Button
              onClick={handleCompleteSale}
              variant="success"
              className="complete-sale-button"
              disabled={completingSale || paymentSummary.amountDue > 0}
            >
              {completingSale ? (
                "جاري الإنهاء..."
              ) : (
                <>
                  <FiCheck /> إتمام البيع
                </>
              )}
            </Button>
            <Button onClick={handlePrint} variant="primary" className="print-button">
              <FiPrinter /> طباعة الفاتورة
            </Button>
            <Button onClick={onClose} variant="outline" className="close-button">
              <FiDownload /> إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
