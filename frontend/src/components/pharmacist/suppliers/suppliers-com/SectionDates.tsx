import React from "react";
import { Section, Field } from "./SectionLayout";

interface Props {
  orderDate: string;
  onChangeOrderDate: (value: string) => void;
  expectedDate: string;
  onChangeExpectedDate: (value: string) => void;
  expiryDate: string;
  onChangeExpiryDate: (value: string) => void;
}

export function SectionDates({
  orderDate,
  onChangeOrderDate,
  expectedDate,
  onChangeExpectedDate,
  expiryDate,
  onChangeExpiryDate,
}: Props) {
  return (
    <Section title="التواريخ">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="تاريخ الطلب">
          <input type="date" className="input" value={orderDate} onChange={(e) => onChangeOrderDate(e.target.value)} />
        </Field>
        <Field label="تاريخ التسليم المتوقع">
          <input type="date" className="input" value={expectedDate} onChange={(e) => onChangeExpectedDate(e.target.value)} />
        </Field>
        <Field label="تاريخ انتهاء صلاحية الدواء (اختياري)">
          <input type="date" className="input" value={expiryDate} onChange={(e) => onChangeExpiryDate(e.target.value)} />
        </Field>
      </div>
    </Section>
  );
}
