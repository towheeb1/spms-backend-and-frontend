// src/components/suppliers/SuppliersPage.tsx
import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { useToast } from "../../ui/Toast";
import { Supplier, InventoryItem, PurchaseItem, SupplierPurchaseGroup } from "./types";
import './style/SuppliersPage.css';

// استيراد المكونات الفرعية
import SuppliersTab from "./SuppliersTab";
import PurchasesTab from "./PurchasesTab";
import InventoryTab from "./InventoryTab";
import AddSupplierModal from "./AddSupplierModal";
import AddPurchaseModal from "./AddPurchaseModal";
import EditSupplierModal from "./EditSupplierModal";

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "purchases" | "inventory">("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<SupplierPurchaseGroup[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | number | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, purchasesRes, inventoryRes] = await Promise.all([
        api.get<{ list: Supplier[] }>("/suppliers"),
        api.get<{ list: SupplierPurchaseGroup[] }>("/purchases"),
        api.get<{ list: InventoryItem[] }>("/inventory"),
      ]);
      
      // support different response shapes: { items: [] } or { list: [] }
      setSuppliers((suppliersRes.data as any).items || suppliersRes.data.list || []);
      setPurchases(purchasesRes.data.list || []);
      setInventory(inventoryRes.data.list || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (data: Omit<Supplier, "id" | "status" | "products_count">) => {
    // return the promise so caller can await
    return api.post("/suppliers", { ...data, status: "active" })
      .then(async (res) => {
        await loadData();
        setShowAddSupplier(false);
        toast.success('تمت إضافة المورد بنجاح');
        // Open Add Purchase modal and preselect this supplier
        const newId = res?.data?.id ?? res?.data?.insertId ?? null;
        if (newId) {
          setPreselectedSupplierId(newId);
          setShowAddPurchase(true);
        }
      })
      .catch((err: any) => {
        console.error("Failed to add supplier", err);
        toast.error(err?.response?.data?.error || 'فشل في إضافة المورد');
        throw err;
      });
  };

  const handleUpdateSupplier = async (id: string | number, data: Partial<Supplier>) => {
    try {
      await api.put(`/suppliers/${id}`, data);
      await loadData();
    } catch (err) {
      console.error("Failed to update supplier", err);
    }
  };

  const handleDeleteSupplier = async (id: string | number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      await loadData();
    } catch (err) {
      console.error("Failed to delete supplier", err);
    }
  };

  const handleAddPurchase = async (data: { supplier_id: string | number; items: PurchaseItem[]; notes?: string; currency?: string; supplier_reference?: string; exchange_rate?: number; warehouse?: string; order_date?: string; expected_date?: string; payment_terms?: string; shipping_terms?: string; supplier_contact?: any; total_amount?: number; amount_received?: number; amount_remaining?: number; expiry_date?: string }) => {
    try {
      // ensure numeric subtotals and total
      const items = data.items.map(it => ({
        ...it,
        quantity: Number(it.quantity || 0),
        price: Number(it.price || 0),
        subtotal: Number((Number(it.quantity || 0) * Number(it.price || 0)) || 0)
      }));
      const total_amount = items.reduce((s, it) => s + (it.subtotal || 0), 0);
      const amount_received = Number(data.amount_received || 0);
      const amount_remaining = typeof data.amount_remaining !== 'undefined' ? Number(data.amount_remaining) : Math.max(total_amount - amount_received, 0);

      await api.post("/purchases", { ...data, items, total_amount, amount_received, amount_remaining });
      await loadData();
    } catch (err) {
      console.error("Failed to add purchase", err);
    }
  };

  const flatPurchases = purchases.flatMap((group) => group.purchases || []);
  const stats = {
    totalSuppliers: suppliers.length,
    totalPurchases: flatPurchases.length,
    totalInventoryItems: inventory.length,
    pendingOrders: flatPurchases.filter((p) => p.status === "pending").length,
  };

  return (
    <div className="suppliers-page-container">
      {/* العنوان والتحكم */}
      <div className="suppliers-page-header">
        <div className="suppliers-page-title-section">
          <h1>الموردون والمشتريات</h1>
          <p>إدارة الموردين وأوامر الشراء والمخزون</p>
        </div>
        <div className="suppliers-page-header-buttons">
          <button
            className="suppliers-page-header-button suppliers-page-header-button-primary"
            onClick={() => setActiveTab("suppliers")}
          >
            <span>🏢</span> الموردون
          </button>
          <button
            className="suppliers-page-header-button suppliers-page-header-button-success"
            onClick={() => setActiveTab("purchases")}
          >
            <span>🛒</span> المشتريات
          </button>
        </div>
      </div>

      {/* الإحصائيات */}
       <div className="suppliers-page-stats-grid">
        <div className="suppliers-page-stat-card">
          <div className="suppliers-page-stat-icon">🏢</div>
          <div className="suppliers-page-stat-content">
            <div className="suppliers-page-stat-number">{stats.totalSuppliers}</div>
            <div className="suppliers-page-stat-label">إجمالي الموردين</div>
          </div>
        </div>
        <div className="suppliers-page-stat-card">
          <div className="suppliers-page-stat-icon">🛒</div>
          <div className="suppliers-page-stat-content">
            <div className="suppliers-page-stat-number">{stats.totalPurchases}</div>
            <div className="suppliers-page-stat-label">أوامر الشراء</div>
          </div>
        </div>
        <div className="suppliers-page-stat-card">
          <div className="suppliers-page-stat-icon">📦</div>
          <div className="suppliers-page-stat-content">
            <div className="suppliers-page-stat-number">{stats.totalInventoryItems}</div>
            <div className="suppliers-page-stat-label">عناصر المخزون</div>
          </div>
        </div>
        <div className="suppliers-page-stat-card">
          <div className="suppliers-page-stat-icon">⏳</div>
          <div className="suppliers-page-stat-content">
            <div className="suppliers-page-stat-number">{stats.pendingOrders}</div>
            <div className="suppliers-page-stat-label">أوامر معلقة</div>
          </div>
        </div>
      </div> 

      {/* علامات التبويب */}
      <div className="suppliers-page-tabs-container">
        <div className="suppliers-page-tabs">
          <button className={`suppliers-page-tab-button ${activeTab === "suppliers" ? "suppliers-page-tab-button-active" : "suppliers-page-tab-button-inactive"}`} onClick={() => setActiveTab("suppliers")}>
            قائمة الموردين
          </button>
          <button className={`suppliers-page-tab-button ${activeTab === "purchases" ? "suppliers-page-tab-button-purchases-active" : "suppliers-page-tab-button-inactive"}`} onClick={() => setActiveTab("purchases")}>
            أوامر الشراء
          </button>
          <button className={`suppliers-page-tab-button ${activeTab === "inventory" ? "suppliers-page-tab-button-inventory-active" : "suppliers-page-tab-button-inactive"}`} onClick={() => setActiveTab("inventory")}>
            ربط المخزون
          </button>
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className="suppliers-page-content">
        {loading ? (
          <div className="suppliers-page-loading">
            <div className="suppliers-page-spinner"></div>
          </div>
        ) : (
          <>
            {activeTab === "suppliers" && (
              <SuppliersTab 
                suppliers={suppliers}
                purchases={purchases}
                onAdd={() => setShowAddSupplier(true)}
                onEdit={setEditingSupplier}
                onDelete={handleDeleteSupplier}
                onDataChange={loadData}
                onPurchase={(supplierId) => {
                  setPreselectedSupplierId(supplierId);
                  setShowAddPurchase(true);
                }}
              />
            )}
            {activeTab === "purchases" && (
              <PurchasesTab 
                purchases={purchases}
                onAdd={() => setShowAddPurchase(true)}
                onDataChange={loadData}
              />
            )}
            {activeTab === "inventory" && (
              <InventoryTab 
                inventory={inventory}
                suppliers={suppliers}
                purchases={purchases}
                onPurchase={(supplierId) => {
                  setPreselectedSupplierId(supplierId);
                  setActiveTab("purchases");
                  setShowAddPurchase(true);
                }}
              />
            )}
          </>
        )}
      </div>

      {showAddSupplier && (
        <AddSupplierModal 
          onClose={() => setShowAddSupplier(false)}
          onAdd={handleAddSupplier}
        />
      )}

      {showAddPurchase && (
        <AddPurchaseModal 
          onClose={() => { setShowAddPurchase(false); setPreselectedSupplierId(null); }}
          onAdd={handleAddPurchase}
          suppliers={suppliers}
          initialSupplierId={preselectedSupplierId}
        />
      )}

      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onUpdate={handleUpdateSupplier}
        />
      )}
    </div>
  );
}