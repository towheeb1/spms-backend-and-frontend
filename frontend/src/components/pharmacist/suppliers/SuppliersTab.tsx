// src/components/suppliers/SuppliersTab.tsx
import { Supplier, SupplierPurchaseGroup } from "./types";
import SupplierDetailsModal from "./suppliers-com/SupplierDetailsModal";
import { api } from "../../../services/api";
import { useEffect, useState } from "react";
import './style/SuppliersTab.css';

interface Props {
  suppliers: Supplier[];
  purchases?: SupplierPurchaseGroup[];
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string | number) => void;
  onDataChange?: () => void;
  onPurchase?: (supplierId: string | number) => void;
  initialOpenSupplierId?: string | number | null;
}

export default function SuppliersTab({ suppliers, purchases = [], onAdd, onEdit, onDelete, onDataChange, onPurchase, initialOpenSupplierId }: Props) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPurchaseGroup | null>(null);
  const [initialOpenOrderId, setInitialOpenOrderId] = useState<string | number | null>(null);

  const handlePayment = async (id: number, amount: number): Promise<void> => {
    try {
      await api.put(`/purchases/${id}/payment`, { amount });
      onDataChange?.();
    } catch (err) {
      console.error("Payment failed", err);
      alert("فشل في إضافة الدفعة");
    }
  };

  useEffect(() => {
    if (!initialOpenSupplierId) return;
    const group = purchases.find((g) => String(g.supplier_id) === String(initialOpenSupplierId));
    if (group) {
      setSelectedSupplier(group);
      const outstanding = group.purchases?.find((order) => Number(order.amount_remaining || 0) > 0);
      setInitialOpenOrderId(outstanding?.id ?? null);
    }
  }, [initialOpenSupplierId, purchases]);

  return (
    <div className="suppliers-tab-container">
      <div className="suppliers-tab-header">
        <h2 className="suppliers-tab-title">قائمة الموردين</h2>
        <button 
          className="suppliers-tab-add-button"
          onClick={onAdd}
        >
          <span>➕</span> إضافة مورد جديد
        </button>
      </div>
      
      {suppliers.length > 0 ? (
        <div className="suppliers-tab-table-wrapper">
          <table className="suppliers-tab-table">
            <thead>
              <tr className="suppliers-tab-table-header-row">
                  <th className="suppliers-tab-table-header">الاسم</th>
                  <th className="suppliers-tab-table-header">الاتصال</th>
                  <th className="suppliers-tab-table-header">المنتجات</th>
                  <th className="suppliers-tab-table-header">الإجمالي</th>
                  <th className="suppliers-tab-table-header">المتبقي</th>
                  <th className="suppliers-tab-table-header">الحالة</th>
                  <th className="suppliers-tab-table-header">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="suppliers-tab-table-body">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="suppliers-tab-table-row">
                  <td className="suppliers-tab-table-cell">
                    <div className="suppliers-tab-supplier-name">{supplier.name}</div>
                    <div className="suppliers-tab-supplier-category">{supplier.category}</div>
                  </td>
                  <td className="suppliers-tab-table-cell suppliers-tab-contact-cell">
                    <div className="suppliers-tab-contact-info">{supplier.phone}</div>
                    <div className="suppliers-tab-contact-secondary">{supplier.email}</div>
                  </td>
                  <td className="suppliers-tab-table-cell suppliers-tab-products-cell">
                    {/* عرض أول 2-3 أسماء منتجات مسجلة باسم المورد */}
                    {(() => {
                      const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                      if (!group) return <>{supplier.products_count || 0} منتج</>;
                      const names: string[] = [];
                      for (const ord of group.purchases) {
                        for (const it of ord.items || []) {
                          if (it && it.name) names.push(String(it.name));
                        }
                      }
                      const unique = Array.from(new Set(names));
                      const first = unique.slice(0, 3);
                      return (
                        <div className="suppliers-tab-products-info">
                          {first.length ? (
                            <>
                              <div className="suppliers-tab-products-list">{first.join('، ')}</div>
                              {unique.length > first.length && <div className="suppliers-tab-products-more">و {unique.length - first.length} أكثر...</div>}
                            </>
                          ) : (
                            <>{supplier.products_count || 0} منتج</>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="suppliers-tab-table-cell suppliers-tab-amount-cell">
                    {(() => {
                      const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                      return group ? `${group.total_spent ?? 0}` : "0";
                    })()}
                  </td>
                  <td className="suppliers-tab-table-cell suppliers-tab-amount-cell">
                    {(() => {
                      const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                      return group ? `${group.total_due ?? 0}` : "0";
                    })()}
                  </td>
                  <td className="suppliers-tab-table-cell">
                    {(() => {
                      const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                      // derive realistic status
                      if (group && Number(group.total_due || 0) > 0) {
                        return <span className="suppliers-tab-status-badge suppliers-tab-status-due">له متأخرات</span>;
                      }
                      if (group && Number(group.orders_count || 0) > 0) {
                        return <span className="suppliers-tab-status-badge suppliers-tab-status-dealer">متعامل</span>;
                      }
                      // fallback to supplier.status
                      if (supplier.status === "active") {
                        return <span className="suppliers-tab-status-badge suppliers-tab-status-active">نشط</span>;
                      }
                      return <span className="suppliers-tab-status-badge suppliers-tab-status-inactive">غير نشط</span>;
                    })()}
                  </td>
                  <td className="suppliers-tab-table-cell">
                    <div className="suppliers-tab-actions">
                      <button
                        className="suppliers-tab-action-button suppliers-tab-button-details"
                        onClick={() => {
                          // افتح مودال تفاصيل المورد (إذا وجدت 구매ات)
                          const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                          if (group) setSelectedSupplier(group);
                          else alert("لا توجد مشتريات مسجلة لهذا المورد");
                        }}
                      >
                        تفاصيل
                      </button>
                      <button
                        className="suppliers-tab-action-button suppliers-tab-button-edit"
                        onClick={() => onEdit(supplier)}
                      >
                        تعديل
                      </button>
                      <button
                        className="suppliers-tab-action-button suppliers-tab-button-delete"
                        onClick={() => onDelete(supplier.id)}
                      >
                        حذف
                      </button>
                      {onPurchase && (
                        <button
                          className="suppliers-tab-action-button suppliers-tab-button-buy"
                          onClick={() => onPurchase(supplier.id)}
                        >
                          شراء
                        </button>
                      )}
                      {/* زر سداد سريع: يظهر إذا كان هناك مبلغ متبقي ضمن مجموعة المورد */}
                      {(() => {
                        const group = purchases.find((g) => String(g.supplier_id) === String(supplier.id));
                        const totalDue = group ? group.total_due : 0;
                        if (totalDue > 0) {
                          const targetOrder = group?.purchases.find(p => Number(p.amount_remaining || 0) > 0);
                          if (!targetOrder) {
                            return (
                              <button
                                className="suppliers-tab-button-pay"
                                onClick={() => { alert('لا يوجد أمر شراء به مبلغ متبقي'); }}
                              >سداد</button>
                            );
                          }

                          return (
                            <button
                              className="suppliers-tab-button-pay"
                              onClick={() => {
                                setInitialOpenOrderId(targetOrder.id);
                                setSelectedSupplier(group || null);
                              }}
                            >سداد</button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="suppliers-tab-empty-state">
          <div className="suppliers-tab-empty-icon">🏢</div>
          <h3 className="suppliers-tab-empty-title">لا توجد موردين</h3>
          <p className="suppliers-tab-empty-description">ابدأ بإضافة مورد جديد</p>
          <button
            className="suppliers-tab-empty-button"
            onClick={onAdd}
          >
            إضافة مورد جديد
          </button>
        </div>
      )}

      {selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          initialOpenOrderId={initialOpenOrderId}
          onClose={() => { setSelectedSupplier(null); setInitialOpenOrderId(null); }}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
}