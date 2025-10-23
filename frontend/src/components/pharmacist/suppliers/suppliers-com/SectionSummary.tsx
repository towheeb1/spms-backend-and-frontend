import React from "react";
import { Section, Field } from "./SectionLayout";

interface Props {
  totalAmount: number;
  amountReceived: number;
  currency: string;
  notes: string;
  onChangeNotes: (value: string) => void;
}

export function SectionSummary({ totalAmount, amountReceived, currency, notes, onChangeNotes }: Props) {
  return (
    <Section title="الملخص والملاحظات">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="المبلغ الإجمالي" hint="الإجمالي يحسب من مجموع بنود الطلب.">
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold">{totalAmount.toFixed(2)}</div>
          </div>
          <div className="mt-1 text-xs opacity-60">
            المتبقي: <b>{Math.max(0, totalAmount - amountReceived).toFixed(2)} {currency}</b>
          </div>
        </Field>

        <Field label="ملاحظات">
          <textarea
            className="h-20 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
          />
        </Field>
      </div>
    </Section>
  );
}
