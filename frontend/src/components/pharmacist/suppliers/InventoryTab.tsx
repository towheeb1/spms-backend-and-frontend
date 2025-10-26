// src/components/suppliers/InventoryTab.tsx
import { useEffect, useMemo } from "react";
import { InventoryItem, Supplier, SupplierPurchaseGroup } from "./types";
import './style/InventoryTab.css';

interface Props {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchases?: SupplierPurchaseGroup[];
  onPurchase?: (supplierId: string | number) => void;
  highlightInventoryId?: string | number | null;
}

export default function InventoryTab({ inventory, suppliers, purchases = [], onPurchase, highlightInventoryId }: Props) {
  const supplierMap = useMemo(() => {
    const map = new Map<string, Supplier>();
    suppliers.forEach((supplier) => {
      map.set(String(supplier.id), supplier);
    });
    return map;
  }, [suppliers]);

  const itemSupplierMap = useMemo(() => {
    const map = new Map<string, SupplierPurchaseGroup>();
    purchases.forEach((group) => {
      (group.purchases || []).forEach((purchase) => {
        (purchase.items || []).forEach((item) => {
          const key = String(item.medicine_id ?? item.id ?? "");
          if (key) {
            map.set(key, group);
          }
        });
      });
    });
    return map;
  }, [purchases]);

  useEffect(() => {
    if (!highlightInventoryId) return;
    const card = document.getElementById(`inventory-card-${highlightInventoryId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightInventoryId, inventory.length]);

  return (
    <div className="inventory-tab-container">
      <div className="inventory-tab-header">
        <h2 className="inventory-tab-title">ربط المخزون</h2>
        <div className="inventory-tab-stats">
          إجمالي العناصر: {inventory.length}
        </div>
      </div>

      {inventory.length > 0 ? (
        <div className="inventory-tab-cards-grid">
          {inventory.map((item) => (
            <div
              key={item.id}
              id={`inventory-card-${item.id}`}
              className={`inventory-tab-card ${highlightInventoryId && String(item.id) === String(highlightInventoryId) ? "inventory-tab-card-highlight" : ""}`}
            >
              <div className="inventory-tab-card-header">
                <div className="inventory-tab-item-info">
                  <div className="inventory-tab-item-name">{item.name}</div>
                  <div className="inventory-tab-item-category">{item.category}</div>
                </div>
                <div
                  className={`inventory-tab-stock-badge ${(() => {
                    const percentage = item.min_stock > 0 ? (item.stock / item.min_stock) * 100 : 100;
                    if (percentage >= 150) return "inventory-tab-stock-safe";
                    if (percentage >= 100) return "inventory-tab-stock-in";
                    if (percentage >= 50) return "inventory-tab-stock-warning";
                    return "inventory-tab-stock-out";
                  })()}`}
                  title={`المخزون الحالي: ${item.stock} / الحد الأدنى ${item.min_stock}`}
                >
                  {item.stock} وحدة
                </div>
              </div>

              <div className="inventory-tab-item-details">
                <div className="inventory-tab-detail-row">
                  <span className="inventory-tab-detail-label">الحد الأدنى:</span>
                  <span className="inventory-tab-detail-value">{item.min_stock}</span>
                </div>
                <div className="inventory-tab-detail-row">
                  <span className="inventory-tab-detail-label">المورد:</span>
                  <span className="inventory-tab-detail-value">{(() => {
                    const purchaseGroup = itemSupplierMap.get(String(item.id));
                    if (purchaseGroup) return purchaseGroup.supplier_name;
                    if (item.supplier_id && supplierMap.has(String(item.supplier_id))) {
                      return supplierMap.get(String(item.supplier_id))?.name ?? "غير محدد";
                    }
                    return item.supplier_name || "غير محدد";
                  })()}</span>
                </div>
                <div className="inventory-tab-detail-row">
                  <span className="inventory-tab-detail-label">آخر تحديث:</span>
                  <span className="inventory-tab-detail-value">{new Date(item.last_updated).toLocaleDateString('ar-SA')}</span>
                </div>
                {(() => {
                  const percentage = item.min_stock > 0 ? Math.round((item.stock / item.min_stock) * 100) : 100;
                  const statusLabel = percentage >= 150
                    ? "فائض"
                    : percentage >= 100
                    ? "آمن"
                    : percentage >= 50
                    ? "يتطلب مراقبة"
                    : "حرج";
                  return (
                    <div className="inventory-tab-detail-row">
                      <span className="inventory-tab-detail-label">حالة المخزون:</span>
                      <span className="inventory-tab-detail-value">
                        {statusLabel} ({percentage}% من الحد الأدنى)
                      </span>
                    </div>
                  );
                })()}
              </div>

              {item.stock <= item.min_stock && (
                <div className="inventory-tab-warning">
                  <div className="inventory-tab-warning-text">
                    <span>⚠️</span>
                    تحتاج إعادة توريد
                  </div>
                  {(() => {
                    const supplierId = (() => {
                      const purchaseGroup = itemSupplierMap.get(String(item.id));
                      if (purchaseGroup) return purchaseGroup.supplier_id;
                      if (item.supplier_id) return item.supplier_id;
                      return undefined;
                    })();
                    if (supplierId && onPurchase) {
                      return (
                        <button
                          className="inventory-tab-warning-button"
                          onClick={() => onPurchase(supplierId)}
                        >
                          إعادة التوريد من المورد
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="inventory-tab-empty-state">
          <div className="inventory-tab-empty-icon">📦</div>
          <h3 className="inventory-tab-empty-title">لا توجد عناصر في المخزون</h3>
          <p className="inventory-tab-empty-description">ابدأ بإضافة عناصر للمخزون</p>
        </div>
      )}
    </div>
  );
}