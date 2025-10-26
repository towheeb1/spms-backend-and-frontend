import type { InventoryItem, SupplierPurchaseGroup } from "../components/pharmacist/suppliers/types";

export type NotificationSeverity = "critical" | "warning" | "info";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: NotificationSeverity;
  action?: { label: string; to: string };
  meta?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return "غير محدد";
  try {
    return new Date(value).toLocaleDateString("ar-SA");
  } catch {
    return value;
  }
};

const resolveItemName = (item: InventoryItem | any) =>
  item?.name || item?.trade_name || item?.medicine_name || item?.title || "صنف غير معروف";

export const buildPharmacistNotifications = (
  inventory: InventoryItem[],
  purchases: SupplierPurchaseGroup[]
): NotificationItem[] => {
  const today = new Date();
  const nearExpiryThreshold = new Date();
  nearExpiryThreshold.setDate(today.getDate() + 30);

  const dueThreshold = new Date();
  dueThreshold.setDate(today.getDate() + 7);

  const lowStockNotifications: NotificationItem[] = inventory
    .filter((item) => typeof item.min_stock === "number" && item.min_stock > 0 && Number(item.stock || 0) <= Number(item.min_stock))
    .map((item) => ({
      id: `low-stock-${item.id}`,
      title: `المخزون منخفض: ${resolveItemName(item)}`,
      description: `المخزون الحالي ${item.stock ?? 0} وحدة، الحد الأدنى ${item.min_stock}.`,
      severity: "critical" as const,
      action: {
        label: "عرض الصنف",
        to: `/inventory?highlightId=${item.id}`,
      },
      meta: item.category || undefined,
    }));

  const nearExpiryNotifications: NotificationItem[] = inventory
    .filter((item) => {
      if (!item.nearest_expiry) return false;
      try {
        const expiry = new Date(item.nearest_expiry);
        return expiry <= nearExpiryThreshold;
      } catch {
        return false;
      }
    })
    .map((item) => ({
      id: `expiry-${item.id}`,
      title: `قرب انتهاء: ${resolveItemName(item)}`,
      description: `أقرب تاريخ صلاحية: ${formatDate(item.nearest_expiry)}.`,
      severity: "warning" as const,
      action: {
        label: "مراجعة الصنف",
        to: `/inventory?highlightId=${item.id}`,
      },
      meta: item.category || undefined,
    }));

  const supplierDueNotifications: NotificationItem[] = purchases
    .filter((group) => Number(group.total_due || 0) > 0)
    .map((group) => ({
      id: `supplier-due-${group.supplier_id}`,
      title: `مستحقات على المورد: ${group.supplier_name}`,
      description: `المتبقي: ${Number(group.total_due || 0).toLocaleString("ar-YE")} ر.ي`,
      severity: "warning" as const,
      action: {
        label: "فتح المورد",
        to: `/suppliers?tab=suppliers&supplierId=${group.supplier_id}`,
      },
    }));

  const supplierPaymentDeadlineNotifications: NotificationItem[] = [];

  purchases.forEach((group) => {
    group.purchases?.forEach((purchase) => {
      const remaining = Number(purchase.amount_remaining || 0);
      if (remaining <= 0) return;
      if (!purchase.expected_date) return;

      let dueDate: Date | null = null;
      try {
        dueDate = new Date(purchase.expected_date);
      } catch {
        dueDate = null;
      }

      if (!dueDate) return;

      const isOverdue = dueDate < today;
      if (!isOverdue && dueDate > dueThreshold) return;

      supplierPaymentDeadlineNotifications.push({
        id: `supplier-installment-${group.supplier_id}-${purchase.id}`,
        title: isOverdue
          ? `تأخر دفعة للمورد ${group.supplier_name}`
          : `دفعة مستحقة قريباً للمورد ${group.supplier_name}`,
        description: `المتبقي ${remaining.toLocaleString("ar-YE")} ر.ي، تاريخ الاستحقاق ${formatDate(purchase.expected_date)}.`,
        severity: (isOverdue ? "critical" : "warning") as NotificationSeverity,
        action: {
          label: "مراجعة الدفعة",
          to: `/suppliers?tab=suppliers&supplierId=${group.supplier_id}&orderId=${purchase.id}`,
        },
      });
    });
  });

  return [
    ...lowStockNotifications,
    ...nearExpiryNotifications,
    ...supplierDueNotifications,
    ...supplierPaymentDeadlineNotifications,
  ];
};
