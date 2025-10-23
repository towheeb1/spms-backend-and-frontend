import React from "react";
import { Section, Field } from "./SectionLayout";
import { Select } from "../../../ui/Select";
import { InstallmentFrequency, PaymentTerm } from "./types";

interface Props {
  paymentTerms: PaymentTerm;
  onChangePaymentTerms: (value: PaymentTerm) => void;
  currency: string;
  onChangeCurrency: (value: string) => void;
  exchangeRate: number;
  onChangeExchangeRate: (value: number) => void;
  cashPayFull: boolean;
  onToggleCashPayFull: (value: boolean) => void;
  creditDays: number;
  onChangeCreditDays: (value: number) => void;
  downPayment: number;
  onChangeDownPayment: (value: number) => void;
  installmentsCount: number;
  onChangeInstallmentsCount: (value: number) => void;
  installmentFrequency: InstallmentFrequency;
  onChangeInstallmentFrequency: (value: InstallmentFrequency) => void;
  firstDueDate: string;
  onChangeFirstDueDate: (value: string) => void;
  amountReceived: number;
  onChangeAmountReceived: (value: number) => void; // إضافة هذا الـ prop للتحكم في التغيير
  amountRemaining: number;
  installmentValue: number;
  totalAmount: number;
}

export function SectionPayment({
  paymentTerms,
  onChangePaymentTerms,
  currency,
  onChangeCurrency,
  exchangeRate,
  onChangeExchangeRate,
  cashPayFull,
  onToggleCashPayFull,
  creditDays,
  onChangeCreditDays,
  downPayment,
  onChangeDownPayment,
  installmentsCount,
  onChangeInstallmentsCount,
  installmentFrequency,
  onChangeInstallmentFrequency,
  firstDueDate,
  onChangeFirstDueDate,
  amountReceived,
  onChangeAmountReceived, // استخدام الـ prop الجديد
  amountRemaining,
  installmentValue,
  totalAmount,
}: Props) {
  return (
    <Section title="الدفع والشحن">
      <div className="space-y-6">
        {/* الشروط العامة - الحقول في سطر واحد عند الشاشات المتوسطة فأكبر */}
        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          {/* شروط الدفع */}
          <div className="md:w-1/4">
            <Field label="شروط الدفع">
              <Select
                value={paymentTerms}
                onChange={(value) => onChangePaymentTerms(value as PaymentTerm)}
                options={[
                  { label: "نقداً", value: "cash" },
                  { label: "آجل", value: "credit" },
                  { label: "دفعات جزئية / أقساط", value: "partial" },
                ]}
                placeholder="اختر شروط الدفع"
              />
            </Field>
          </div>

          {/* العملة وسعر الصرف */}
          <div className="md:w-1/4">
            <Field label="العملة وسعر الصرف" hint="سعر الصرف بالنسبة لليمنى (YER). اترك 1 إذا كانت العملة YER.">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Select
                  value={currency}
                  onChange={(v) => onChangeCurrency(String(v))}
                  options={[
                    { label: "ريال يمني (YER)", value: "YER" },
                    { label: "ريال سعودي (SAR)", value: "SAR" },
                    { label: "دولار أمريكي (USD)", value: "USD" },
                    { label: "يورو (EUR)", value: "EUR" },
                  ]}
                  placeholder="اختر العملة"
                />
                <input
                  type="number"
                  className="input"
                  value={exchangeRate}
                  onChange={(e) => onChangeExchangeRate(Number(e.target.value) || 0)}
                  min={0}
                  step={0.0001}
                  placeholder="سعر الصرف"
                />
              </div>
            </Field>
          </div>

          {/* المبلغ المسلم */}
          <div className="md:w-1/4">
            <Field label="المبلغ المسلم">
              <input
                type="number"
                min={0}
                className="input"
                value={amountReceived}
                onChange={(e) => onChangeAmountReceived(Math.max(0, Number(e.target.value) || 0))}
                placeholder="أدخل المبلغ المدفوع"
              />
              <div className="mt-1 text-xs opacity-60">
                {paymentTerms === "cash" ? "يُحدّد تلقائياً بناءً على خيار الدفع الكامل، أو أدخله يدوياً." : paymentTerms === "credit" ? "أدخل المبلغ المدفوع مقدمًا إن وجد." : "يتطابق مع الدفعة المقدّمة، أو أدخله يدوياً."}
              </div>
            </Field>
          </div>

          {/* المبلغ المتبقي */}
          <div className="md:w-1/4">
            <Field label="المبلغ المتبقي">
              <div className="rounded-xl bg-white/6 px-3 py-2 text-sm font-medium">
                {amountRemaining.toFixed(2)} {currency}
              </div>
              <div className="mt-1 text-xs opacity-60">يُحسب تلقائياً: الإجمالي - المبلغ المستلم.</div>
            </Field>
          </div>
        </div>

        {/* تفاصيل الدفع النقدي */}
        {paymentTerms === "cash" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h5 className="mb-4 text-sm font-semibold opacity-80">تفاصيل الدفع النقدي</h5>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="خيار الدفع الكامل">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cashPayFull}
                    onChange={(e) => onToggleCashPayFull(e.target.checked)}
                  />
                  <span>دفع كامل المبلغ ({totalAmount.toFixed(2)} {currency})</span>
                </label>
                <div className="mt-1 text-xs opacity-60">يمكنك إلغاء التحديد إذا لم يتم السداد فوراً، وإدخال المبلغ المسلم يدوياً.</div>
              </Field>
            </div>
          </div>
        )}

        {/* تفاصيل الدفع الآجل */}
        {paymentTerms === "credit" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h5 className="mb-4 text-sm font-semibold opacity-80">تفاصيل الدفع الآجل</h5>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="أيام الائتمان">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={creditDays}
                  onChange={(e) => onChangeCreditDays(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="مثال: 30"
                />
                <div className="mt-1 text-xs opacity-60">عدد الأيام المسموح بها للسداد.</div>
              </Field>
            </div>
          </div>
        )}

        {/* تفاصيل الدفع بالأقساط */}
        {paymentTerms === "partial" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h5 className="mb-4 text-sm font-semibold opacity-80">تفاصيل الدفع بالأقساط</h5>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="الدفعة المقدّمة">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={downPayment}
                  onChange={(e) => onChangeDownPayment(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="أدخل الدفعة المقدّمة"
                />
                <div className="mt-1 text-xs opacity-60">سيتم خصمها من الإجمالي لحساب المتبقي.</div>
              </Field>
              <Field label="عدد الأقساط">
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={installmentsCount}
                  onChange={(e) => onChangeInstallmentsCount(Math.max(1, Number(e.target.value) || 1))}
                  placeholder="عدد الأقساط"
                />
              </Field>
              <Field label="تكرار القسط">
                <Select
                  value={installmentFrequency}
                  onChange={(v) => onChangeInstallmentFrequency(v as InstallmentFrequency)}
                  options={[
                    { label: "أسبوعي", value: "weekly" },
                    { label: "شهري", value: "monthly" },
                    { label: "ربع سنوي", value: "quarterly" },
                  ]}
                  placeholder="اختر التكرار"
                />
              </Field>
              <Field label="تاريخ أول استحقاق">
                <input
                  type="date"
                  className="input"
                  value={firstDueDate}
                  onChange={(e) => onChangeFirstDueDate(e.target.value)}
                />
              </Field>
              <Field label="تفاصيل الأقساط">
                <div className="rounded-xl bg-white/6 px-3 py-2 text-sm space-y-1">
                  <div>الدفعة المقدّمة: {downPayment.toFixed(2)} {currency}</div>
                  <div>المتبقي بعد الدفعة: {amountRemaining.toFixed(2)} {currency}</div>
                  <div>قيمة كل قسط: {installmentValue.toFixed(2)} {currency}</div>
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}