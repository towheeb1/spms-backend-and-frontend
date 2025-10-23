// src/components/suppliers/components/SupplierCard.tsx
import { SupplierPurchaseGroup } from "../types";

interface SupplierCardProps {
  group: SupplierPurchaseGroup;
  onViewDetails: (supplier: SupplierPurchaseGroup) => void;
}

function formatCurrency(amount: number, currency?: string | null) {
  const fallbackSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "SAR" ? "﷼" : "ر.ي";
  try {
    return `${new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${fallbackSymbol}`;
  } catch {
    return `${amount.toFixed(2)} ${fallbackSymbol}`;
  }
}

export default function SupplierCard({ group, onViewDetails }: SupplierCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          <span>{group.supplier_name}</span>
          {group.supplier_code && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs opacity-80">رمز: {group.supplier_code}</span>}
        </div>
        <div className="text-sm opacity-70">عدد الطلبات: {group.orders_count}</div>
        <div className="text-sm opacity-70">إجمالي الإنفاق: {formatCurrency(group.total_spent, group.purchases[0]?.currency)}</div>
        <div className="text-sm opacity-70">المبلغ المسلم: {formatCurrency(group.total_received, group.purchases[0]?.currency)}</div>
        <div className="text-sm opacity-70">المتبقي: {formatCurrency(group.total_due, group.purchases[0]?.currency)}</div>
      </div>
      <button
        className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20"
        onClick={() => onViewDetails(group)}
      >
        عرض التفاصيل والتقرير
      </button>
    </div>
  );
}
