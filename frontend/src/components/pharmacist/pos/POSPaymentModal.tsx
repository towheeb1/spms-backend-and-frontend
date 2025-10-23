// src/components/pharmacist/pos/POSPaymentModal.tsx
import React, { useState } from "react";
import { Button, Input, Select } from "../../ui"; // أو المكونات الخاصة بك
import type { PaymentMethod } from "./types"; // ✅ تم التعديل
import "./style/POSPaymentModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  paymentMethods: PaymentMethod[];
  onPayment: (methodId: number, amount: number, isChange: boolean) => void;
}

export default function POSPaymentModal({ isOpen, onClose, total, paymentMethods, onPayment }: Props) {
  const [methodId, setMethodId] = useState<number>(1);
  const [amount, setAmount] = useState(total);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onPayment(methodId, amount, amount > total);
    onClose();
  };

  return (
    <div className="pos-payment-modal-overlay">
      <div className="pos-payment-modal-content">
        <h3 className="pos-payment-modal-title">الدفع</h3>
        <div className="pos-payment-modal-total-section">
          <div className="pos-payment-modal-total-label">المطلوب: {total.toFixed(2)}</div>
        </div>
        <Select
          value={methodId.toString()}
          onChange={(v) => setMethodId(Number(v))}
          options={paymentMethods.map(m => ({ value: m.id.toString(), label: m.name }))}
          className="pos-payment-modal-form"
        />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="المبلغ المدفوع"
          step="0.01"
          className="pos-payment-modal-input"
        />
        <div className="pos-payment-modal-buttons">
          <Button variant="danger" onClick={onClose} className="pos-payment-modal-button-cancel">إلغاء</Button>
          <Button onClick={handleConfirm} className="pos-payment-modal-button-confirm">تأكيد الدفع</Button>
        </div>
      </div>
    </div>
  );
}