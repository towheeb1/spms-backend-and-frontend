import React from "react";
import { Supplier } from "../types";
import { Field, Section } from "./SectionLayout";
import { Select } from "../../../ui/Select";

interface Props {
  suppliers: Supplier[];
  supplierId: string | number;
  onChangeSupplier: (value: string | number) => void;
  supplierCode?: string;
  supplierRef: string;
  onChangeSupplierRef: (value: string) => void;
  shippingTerms: string;
  onChangeShippingTerms: (value: string) => void;
}

export function SectionSupplier({
  suppliers,
  supplierId,
  onChangeSupplier,
  supplierCode,
  supplierRef,
  onChangeSupplierRef,
  shippingTerms,
  onChangeShippingTerms,
}: Props) {
  return (
    <Section title="بيانات المورد والطلب">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="المورد *" hint="سيتم ربط الأصناف بهذا المورد">
          <Select
            value={supplierId}
            onChange={onChangeSupplier}
            options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
            placeholder="اختر موردًا"
          />
        </Field>

        <Field label="رمز المورد الداخلي">
          <div className="rounded-xl bg-white/6 px-3 py-2 text-sm">{supplierCode || "-"}</div>
        </Field>

        <Field label="مرجع المورد (رقم العرض/العقد)">
          <input
            className="input"
            value={supplierRef}
            onChange={(e) => onChangeSupplierRef(e.target.value)}
            placeholder="رقم العرض أو الفاتورة المبدئية (اختياري)"
          />
        </Field>

        <Field label="شروط الشحن والتسليم">
          <input
            className="input"
            value={shippingTerms}
            onChange={(e) => onChangeShippingTerms(e.target.value)}
            placeholder="Incoterms أو شركة الشحن أو رقم التتبع"
          />
        </Field>
      </div>
    </Section>
  );
}
