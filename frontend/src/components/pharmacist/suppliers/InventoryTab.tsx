// src/components/suppliers/InventoryTab.tsx
import { InventoryItem, Supplier, SupplierPurchaseGroup } from "./types";
import './style/InventoryTab.css';

interface Props {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchases?: SupplierPurchaseGroup[];
}

export default function InventoryTab({ inventory, suppliers, purchases = [] }: Props) {
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
            <div key={item.id} className="inventory-tab-card">
              <div className="inventory-tab-card-header">
                <div className="inventory-tab-item-info">
                  <div className="inventory-tab-item-name">{item.name}</div>
                  <div className="inventory-tab-item-category">{item.category}</div>
                </div>
                <div className={`inventory-tab-stock-badge ${
                  item.stock > item.min_stock
                    ? "inventory-tab-stock-in"
                    : "inventory-tab-stock-out"
                }`}>
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
                    // try to infer supplier from purchases that include this medicine
                    const match = purchases.find(g => (g.purchases || []).some(p => (p.items || []).some(it => Number(it.medicine_id || it.id) === Number(item.id))));
                    if (match) return match.supplier_name;
                    // fallback to supplier_name on item if present
                    return item.supplier_name || "غير محدد";
                  })()}</span>
                </div>
                <div className="inventory-tab-detail-row">
                  <span className="inventory-tab-detail-label">آخر تحديث:</span>
                  <span className="inventory-tab-detail-value">{new Date(item.last_updated).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>

              {item.stock <= item.min_stock && (
                <div className="inventory-tab-warning">
                  <div className="inventory-tab-warning-text">
                    <span>⚠️</span>
                    تحتاج إعادة توريد
                  </div>
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