// src/components/suppliers/AddPurchaseModal.tsx
import { PurchaseItem, Supplier } from "./types";
import { SectionSupplier } from "./suppliers-com/SectionSupplier";
import { SectionItems } from "./suppliers-com/SectionItems";
import { SectionPayment } from "./suppliers-com/SectionPayment";
import { SectionDates } from "./suppliers-com/SectionDates";
import { SectionSummary } from "./suppliers-com/SectionSummary";
import { usePurchaseForm } from "./suppliers-com/usePurchaseForm";

interface Props {
  onClose: () => void;
  onAdd: (data: {
    supplier_id: string | number;
    items: PurchaseItem[];
    notes?: string;
    currency?: string;
    supplier_reference?: string;
    exchange_rate?: number;
    order_date?: string;
    expected_date?: string;
    payment_terms?: string;
    credit_days?: number;
    down_payment?: number;
    installments_count?: number;
    installment_frequency?: string;
    first_due_date?: string;
    shipping_terms?: string;
    total_amount?: number;
    amount_received?: number;
    amount_remaining?: number;
    expiry_date?: string;
  }) => void | Promise<any>;
  suppliers: Supplier[];
  initialSupplierId?: string | number | null;
}

export default function AddPurchaseModal({
  onClose,
  onAdd,
  suppliers,
  initialSupplierId = null,
}: Props) {
  const form = usePurchaseForm({ initialSupplierId, suppliers });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.formData.supplier_id) {
      alert("يرجى اختيار مورد");
      return;
    }

    const payload = form.buildPayload();

    try {
      const res = onAdd(payload as any);
      const isPromise = res && typeof (res as any).then === "function";
      if (isPromise) {
        (res as Promise<any>)
          .then(() => onClose())
          .catch((err) => {
            console.error("Create purchase failed", err);
            alert("فشل إنشاء أمر الشراء");
          });
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Create purchase error", err);
      alert("حدث خطأ أثناء إنشاء أمر الشراء");
    }
  };

  const supplierCode = suppliers.find((s) => s.id === form.formData.supplier_id)?.code || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">أمر شراء جديد</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <SectionSupplier
            suppliers={suppliers}
            supplierId={form.formData.supplier_id}
            onChangeSupplier={(v) => form.setFormData((prev) => ({ ...prev, supplier_id: v }))}
            supplierCode={supplierCode}
            supplierRef={form.supplierRef}
            onChangeSupplierRef={form.setSupplierRef}
            shippingTerms={form.shippingTerms}
            onChangeShippingTerms={form.setShippingTerms}
          />

          <SectionItems
            items={form.formData.items}
            currency={form.currency}
            branchesOptions={form.branchesOptions}
            onAdd={form.addItem}
            onRemove={form.removeItem}
            onUpdate={form.updateItem}
          />

          <SectionPayment
            paymentTerms={form.paymentTerms}
            onChangePaymentTerms={form.setPaymentTerms}
            currency={form.currency}
            onChangeCurrency={form.setCurrency}
            exchangeRate={form.exchangeRate}
            onChangeExchangeRate={form.setExchangeRate}
            cashPayFull={form.cashPayFull}
            onToggleCashPayFull={form.setCashPayFull}
            creditDays={form.creditDays}
            onChangeCreditDays={form.setCreditDays}
            downPayment={form.clampedDownPayment}
            onChangeDownPayment={form.setDownPayment}
            installmentsCount={form.normalizedInstallments}
            onChangeInstallmentsCount={form.setInstallmentCount}
            installmentFrequency={form.installmentFrequency}
            onChangeInstallmentFrequency={form.setInstallmentFrequency}
            firstDueDate={form.firstDueDate}
            onChangeFirstDueDate={form.setFirstDueDate}
            amountReceived={form.amountReceived}
            onChangeAmountReceived={form.setAmountReceived}
            amountRemaining={form.amountRemaining}
            installmentValue={form.installmentValue}
            totalAmount={form.totalAmount}
          />

          <SectionDates
            orderDate={form.orderDate}
            onChangeOrderDate={form.setOrderDate}
            expectedDate={form.expectedDate}
            onChangeExpectedDate={form.setExpectedDate}
            expiryDate={form.expiryDate}
            onChangeExpiryDate={form.setExpiryDate}
          />

          <SectionSummary
            totalAmount={form.totalAmount}
            amountReceived={form.amountReceived}
            currency={form.currency}
            notes={form.formData.notes}
            onChangeNotes={(value) => form.setFormData((prev) => ({ ...prev, notes: value }))}
          />

          <div className="sticky bottom-0 z-10 mt-2 bg-gradient-to-t from-black/30 to-transparent pt-2">
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-green-600/90 px-4 py-2 transition-colors hover:bg-green-600"
              >
                إنشاء أمر الشراء
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-600/80 px-4 py-2 transition-colors hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
