import { useEffect, useState } from "react";
import { api } from "../../../../services/api";
import { PurchaseItem, Supplier } from "../types";
import {
  PurchaseItemWithBranch,
  BranchOption,
  PaymentTerm,
  InstallmentFrequency,
} from "./types";

interface FormDataState {
  supplier_id: string | number;
  items: PurchaseItemWithBranch[];
  notes: string;
}

interface UsePurchaseFormArgs {
  initialSupplierId?: string | number | null;
  suppliers: Supplier[];
}

export function usePurchaseForm({ initialSupplierId = null, suppliers }: UsePurchaseFormArgs) {
  const [currency, setCurrency] = useState<string>("YER");
  const [supplierRef, setSupplierRef] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>("cash");
  const [creditDays, setCreditDays] = useState<number>(0);
  const [shippingTerms, setShippingTerms] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [cashPayFull, setCashPayFull] = useState<boolean>(true);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [installmentCount, setInstallmentCount] = useState<number>(2);
  const [installmentFrequency, setInstallmentFrequency] = useState<InstallmentFrequency>("monthly");
  const [firstDueDate, setFirstDueDate] = useState<string>("");

  function normalizeNumber(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function computeDerivedValues(item: PurchaseItemWithBranch): PurchaseItemWithBranch {
    const quantity = Math.max(0, normalizeNumber(item.quantity));
    const wholesale = Math.max(0, normalizeNumber(item.wholesale_price ?? item.price));
    const packsPerCarton = Math.max(0, normalizeNumber(item.packs_per_carton));
    const blistersPerPack = Math.max(0, normalizeNumber(item.blisters_per_pack));
    const tabletsPerBlister = Math.max(0, normalizeNumber(item.tablets_per_blister));

    const cartonPrice = wholesale;
    const retailPrice = packsPerCarton > 0 ? cartonPrice / packsPerCarton : 0;
    const blisterPrice = blistersPerPack > 0 ? retailPrice / blistersPerPack : 0;
    const tabletPrice = tabletsPerBlister > 0 ? blisterPrice / tabletsPerBlister : 0;

    const subtotal = normalizeNumber(quantity * cartonPrice);

    return {
      ...item,
      quantity,
      wholesale_price: cartonPrice,
      carton_price: cartonPrice,
      retail_price: retailPrice,
      blister_price: blisterPrice,
      tablet_price: tabletPrice,
      price: cartonPrice,
      subtotal,
    };
  }

  function createEmptyItem(branch?: string | number | null): PurchaseItemWithBranch {
    return computeDerivedValues({
      name: "",
      category: "",
      quantity: 1,
      price: 0,
      wholesale_price: 0,
      retail_price: 0,
      carton_price: 0,
      packs_per_carton: 0,
      blisters_per_pack: 0,
      tablets_per_blister: 0,
      blister_price: 0,
      tablet_price: 0,
      unit: "carton",
      barcode: "",
      batch_no: "",
      expiry_date: null,
      subtotal: 0,
      branch: branch ? String(branch) : "",
    });
  }

  const [formData, setFormData] = useState<FormDataState>({
    supplier_id: (initialSupplierId ?? "") as string | number,
    items: [createEmptyItem(null)],
    notes: "",
  });

  const [branchesOptions, setBranchesOptions] = useState<BranchOption[]>([]);

  const totalAmount = formData.items.reduce((sum: number, item: PurchaseItem) => sum + normalizeNumber(item.subtotal), 0);

  const clampedDownPayment = Math.min(totalAmount, Math.max(0, downPayment));
  const normalizedInstallments = Math.max(1, Math.floor(installmentCount || 0));
  const amountRemaining = Math.max(0, Number(totalAmount) - Number(amountReceived || 0));
  const installmentValue =
    paymentTerms === "partial" ? (normalizedInstallments > 0 ? amountRemaining / normalizedInstallments : 0) : 0;

  useEffect(() => {
    if (paymentTerms === "cash") {
      const target = cashPayFull ? totalAmount : 0;
      if (amountReceived !== target) setAmountReceived(target);
    } else if (paymentTerms === "credit") {
      if (amountReceived !== 0) setAmountReceived(0);
    } else if (paymentTerms === "partial") {
      if (amountReceived !== clampedDownPayment) setAmountReceived(clampedDownPayment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentTerms, totalAmount, cashPayFull, clampedDownPayment]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/pharmacies/branches");
        const list = data?.list || data?.branches || data || [];
        if (Array.isArray(list) && list.length) {
          setBranchesOptions(
            list.map((b: any) => ({
              label: b.name || b.display_name || b.title || `فرع ${b.id}`,
              value: String(b.id),
            }))
          );
          setFormData((prev) => ({
            ...prev,
            items: prev.items.map((it, i) =>
              computeDerivedValues(i === 0 && !it.branch ? { ...it, branch: String(list[0].id) } : it)
            ),
          }));
          return;
        }
      } catch {
        /* ignore */
      }
      try {
        const { data: pd } = await api.get("/pharmacist/profile");
        const p = pd?.profile;
        const bc = Number(p?.branches_count || 1);
        const bdata = p?.branches || [];
        if (Array.isArray(bdata) && bdata.length) {
          const opts = bdata.map((b: any, i: number) => ({
            label: b.name || `الفرع ${i + 1}`,
            value: String(i),
          }));
          setBranchesOptions(opts);
        } else {
          const opts = Array.from({ length: Math.max(1, bc) }).map((_, i) => ({
            label: i === 0 ? "الفرع الرئيسي" : `الفرع ${i + 1}`,
            value: String(i),
          }));
          setBranchesOptions(opts);
        }
      } catch {
        setBranchesOptions([{ label: "الفرع الرئيسي", value: "0" }]);
      }
    })();
  }, []);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        createEmptyItem(branchesOptions[0]?.value || ""),
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const updateItem = (index: number, field: keyof PurchaseItemWithBranch, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item as PurchaseItemWithBranch;
        const updated = { ...item, [field]: value } as PurchaseItemWithBranch;
        return computeDerivedValues(updated);
      }),
    }));
  };

  const buildPayload = () => {
    const items = formData.items.map((it) => ({
      ...computeDerivedValues(it),
      quantity: normalizeNumber(it.quantity || 0),
      price: normalizeNumber(it.price || 0),
      wholesale_price: normalizeNumber(it.wholesale_price || it.price || 0),
      retail_price: normalizeNumber(it.retail_price || 0),
      carton_price: normalizeNumber(it.carton_price || it.wholesale_price || it.price || 0),
      packs_per_carton: normalizeNumber(it.packs_per_carton || 0),
      blisters_per_pack: normalizeNumber(it.blisters_per_pack || 0),
      tablets_per_blister: normalizeNumber(it.tablets_per_blister || 0),
      blister_price: normalizeNumber(it.blister_price || 0),
      tablet_price: normalizeNumber(it.tablet_price || 0),
      subtotal: normalizeNumber(it.subtotal || 0),
      branch: it.branch || undefined,
    }));
    const total = items.reduce((s, it) => s + (it.subtotal || 0), 0);

    return {
      supplier_id: formData.supplier_id,
      items,
      notes: formData.notes || undefined,
      currency,
      supplier_reference: supplierRef || undefined,
      exchange_rate: Number(exchangeRate) || undefined,
      order_date: orderDate || undefined,
      expected_date: expectedDate || undefined,
      payment_terms: paymentTerms || undefined,
      credit_days: paymentTerms === "credit" ? creditDays : undefined,
      down_payment: paymentTerms === "partial" ? clampedDownPayment : undefined,
      installments_count: paymentTerms === "partial" ? normalizedInstallments : undefined,
      installment_frequency: paymentTerms === "partial" ? installmentFrequency : undefined,
      first_due_date: paymentTerms === "partial" ? firstDueDate || undefined : undefined,
      shipping_terms: shippingTerms || undefined,
      total_amount: total,
      amount_received: Number(amountReceived) || 0,
      amount_remaining: amountRemaining,
      expiry_date: expiryDate || undefined,
    } as const;
  };

  return {
    formData,
    setFormData,
    currency,
    setCurrency,
    supplierRef,
    setSupplierRef,
    exchangeRate,
    setExchangeRate,
    orderDate,
    setOrderDate,
    expectedDate,
    setExpectedDate,
    paymentTerms,
    setPaymentTerms,
    creditDays,
    setCreditDays,
    shippingTerms,
    setShippingTerms,
    expiryDate,
    setExpiryDate,
    amountReceived,
    setAmountReceived,
    cashPayFull,
    setCashPayFull,
    downPayment,
    setDownPayment,
    installmentCount,
    setInstallmentCount,
    installmentFrequency,
    setInstallmentFrequency,
    firstDueDate,
    setFirstDueDate,
    branchesOptions,
    addItem,
    removeItem,
    updateItem,
    totalAmount,
    clampedDownPayment,
    normalizedInstallments,
    amountRemaining,
    installmentValue,
    buildPayload,
  };
}
