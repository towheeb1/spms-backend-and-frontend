import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { SupplierPurchaseGroup } from '../../../components/pharmacist/suppliers/types';
import PurchasesTab from '../../../components/pharmacist/suppliers/PurchasesTab';
import AddPurchaseModal from '../../../components/pharmacist/suppliers/AddPurchaseModal';
import { PurchaseItem } from '../../../components/pharmacist/suppliers/types';

const SuppliersPurchaseOrders: React.FC = () => {
  const [purchases, setPurchases] = useState<SupplierPurchaseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ list: SupplierPurchaseGroup[] }>("/purchases");
      setPurchases(response.data.list || []);
    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPurchase = async (data: {
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
  }) => {
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
      await loadPurchases();
      setShowAddPurchase(false);
    } catch (err) {
      console.error("Failed to add purchase", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">أوامر الشراء</h1>
      <p className="text-gray-400 mb-6">هذه الصفحة تتيح إدارة أوامر الشراء من الموردين.</p>

      <PurchasesTab
        purchases={purchases}
        onAdd={() => setShowAddPurchase(true)}
        onDataChange={loadPurchases}
      />

      {showAddPurchase && (
        <AddPurchaseModal
          onClose={() => setShowAddPurchase(false)}
          onAdd={handleAddPurchase}
          suppliers={[]} // يمكن إضافة جلب الموردين إذا لزم الأمر
          initialSupplierId={null}
        />
      )}
    </div>
  );
};

export default SuppliersPurchaseOrders;
