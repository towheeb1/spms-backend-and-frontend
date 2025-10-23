// src/components/pharmacist/pos/POSCustomerSelect.tsx
import React from "react";
import { Select } from "../../ui/Select"; // أو المكون الخاص بك
import type { Customer } from "./types"; // ✅ تم التعديل
import "./style/POSCustomerSelect.css";

interface Props {
  customers?: Customer[];
  selectedCustomerId: number | null;
  onSelect: (id: number) => void;
}

export default function POSCustomerSelect({ customers = [], selectedCustomerId, onSelect }: Props) {
  return (
    <div className="pos-customer-select-container">
      <label className="pos-customer-label">اختر العميل (اختياري)</label>
      <Select
        value={selectedCustomerId?.toString() || ""}
        onChange={(v) => onSelect(Number(v))}
        options={customers.map(c => ({ value: c.id.toString(), label: c.full_name }))}
        placeholder="اختر العميل..."
      />
    </div>
  );
}