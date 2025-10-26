import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import type { InventoryItem, SupplierPurchaseGroup } from "../../../components/pharmacist/suppliers/types";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  action?: { label: string; to: string };
  meta?: string;
}

const severityOrder: Record<NotificationItem["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const formatDate = (value?: string | null) => {
  if (!value) return "غير محدد";
  try {
    return new Date(value).toLocaleDateString("ar-SA");
  } catch {
    return value;
  }
};

const resolveItemName = (item: any) =>
  item?.name || item?.trade_name || item?.medicine_name || item?.title || "صنف غير معروف";

export default function PharmacistNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchases, setPurchases] = useState<SupplierPurchaseGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [inventoryRes, purchasesRes] = await Promise.all([
          api.get<{ list: InventoryItem[] }>("/inventory"),
          api.get<{ list: SupplierPurchaseGroup[] }>("/purchases"),
        ]);
        setInventory(inventoryRes.data.list || []);
        setPurchases(purchasesRes.data.list || []);
      } catch (error) {
        console.error("Failed to load notifications data", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const lowStockNotifications = useMemo(() => {
    return inventory
      .filter((item) => typeof item.min_stock === "number" && item.min_stock > 0 && Number(item.stock || 0) <= Number(item.min_stock))
      .map<NotificationItem>((item) => ({
        id: `low-stock-${item.id}`,
        title: `المخزون منخفض: ${resolveItemName(item)}`,
        description: `المخزون الحالي ${item.stock ?? 0} وحدة، الحد الأدنى ${item.min_stock}.` ,
        severity: "critical",
        action: {
          label: "عرض الصنف",
          to: `/inventory?highlightId=${item.id}`,
        },
        meta: item.category || undefined,
      }));
  }, [inventory]);

  const nearExpiryNotifications = useMemo(() => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + 30);

    return inventory
      .filter((item) => item.nearest_expiry)
      .filter((item) => {
        try {
          const expiry = new Date(item.nearest_expiry as string);
          return expiry <= threshold;
        } catch {
          return false;
        }
      })
      .map<NotificationItem>((item) => ({
        id: `expiry-${item.id}`,
        title: `قرب انتهاء: ${resolveItemName(item)}`,
        description: `أقرب تاريخ صلاحية: ${formatDate(item.nearest_expiry)}.` ,
        severity: "warning",
        action: {
          label: "مراجعة الصنف",
          to: `/inventory?highlightId=${item.id}`,
        },
        meta: item.category || undefined,
      }));
  }, [inventory]);

  const supplierDueNotifications = useMemo(() => {
    return purchases
      .filter((group) => Number(group.total_due || 0) > 0)
      .map<NotificationItem>((group) => ({
        id: `supplier-due-${group.supplier_id}`,
        title: `مستحقات على المورد: ${group.supplier_name}`,
        description: `المتبقي: ${Number(group.total_due || 0).toLocaleString("ar-YE")} ر.ي` ,
        severity: "warning",
        action: {
          label: "فتح المورد",
          to: `/suppliers?tab=suppliers&supplierId=${group.supplier_id}`,
        },
      }));
  }, [purchases]);

  const supplierPaymentDeadlineNotifications = useMemo(() => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + 7);

    const notifications: NotificationItem[] = [];

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
        if (!isOverdue && dueDate > threshold) return;

        notifications.push({
          id: `supplier-installment-${group.supplier_id}-${purchase.id}`,
          title: isOverdue
            ? `تأخر دفعة للمورد ${group.supplier_name}`
            : `دفعة مستحقة قريباً للمورد ${group.supplier_name}`,
          description: `المتبقي ${remaining.toLocaleString("ar-YE") } ر.ي، تاريخ الاستحقاق ${formatDate(purchase.expected_date)}.` ,
          severity: isOverdue ? "critical" : "warning",
          action: {
            label: "مراجعة الدفعة",
            to: `/suppliers?tab=suppliers&supplierId=${group.supplier_id}&orderId=${purchase.id}`,
          },
        });
      });
    });

    return notifications;
  }, [purchases]);

  const notifications = useMemo(() => {
    return [
      ...lowStockNotifications,
      ...nearExpiryNotifications,
      ...supplierDueNotifications,
      ...supplierPaymentDeadlineNotifications,
    ].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [lowStockNotifications, nearExpiryNotifications, supplierDueNotifications, supplierPaymentDeadlineNotifications]);

  const criticalCount = notifications.filter((n) => n.severity === "critical").length;
  const warningCount = notifications.filter((n) => n.severity === "warning").length;

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات والتنبيهات</h1>
          <p className="text-white/60 text-sm">تابع حالة المخزون ومستحقات الموردين من مكان واحد.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Card className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3">
            <div className="text-xs opacity-70">تنبيهات حرجة</div>
            <div className="text-xl font-semibold">{criticalCount}</div>
          </Card>
          <Card className="bg-amber-500/10 border border-amber-400/30 text-amber-200 px-4 py-3">
            <div className="text-xs opacity-70">تنبيهات تحتاج متابعة</div>
            <div className="text-xl font-semibold">{warningCount}</div>
          </Card>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center text-white/60">
          لا توجد إشعارات حالياً. جميع الأمور تحت السيطرة 🚀
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-5 border-l-4 flex flex-col gap-3 transition-all hover:translate-x-1 ${
                notification.severity === "critical"
                  ? "border-red-400/80 bg-red-500/10"
                  : notification.severity === "warning"
                  ? "border-amber-400/80 bg-amber-500/10"
                  : "border-sky-400/80 bg-sky-500/10"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-white">{notification.title}</div>
                <div className="text-sm text-white/70">{notification.description}</div>
                {notification.meta && <div className="text-xs text-white/50">{notification.meta}</div>}
              </div>
              {notification.action && (
                <div className="flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => navigate(notification.action!.to)}
                  >
                    {notification.action.label}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
