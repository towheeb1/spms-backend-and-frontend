// src/components/pharmacist/pos/POSActions.tsx
import React from "react";
import { Button } from "../../ui/Button"; // أو المكون الخاص بك
import type { CartItem } from "./types"; // ✅ تم التعديل
import "./style/POSActions.css";

interface Props {
  cart?: CartItem[];
  onSaveDraft: () => void;
  onPostSale: () => void;
  disabled: boolean;
}

export default function POSActions({ cart = [], onSaveDraft, onPostSale, disabled }: Props) {
  return (
    <div className="pos-actions-container">
      <h3 className="pos-actions-header">العمليات</h3>
      <div className="pos-actions-buttons">
        <Button onClick={onSaveDraft} disabled={disabled} fullWidth>
          حفظ مسودة
        </Button>
        <Button onClick={onPostSale} disabled={disabled} variant="success" fullWidth>
          ترحيل البيع
        </Button>
      </div>
    </div>
  );
}