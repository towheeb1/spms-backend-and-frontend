import React, { useState, useEffect } from 'react';
import { listInventory } from '../../../services/inventory';
import { InventoryStockTable } from '../../../components/pharmacist/inventory/InventoryStockTable';

interface InventoryItem {
  id: number;
  trade_name: string;
  category?: string;
  qty: number;
  price: number;
  nearest_expiry?: string;
}

const InventoryStock: React.FC = () => {
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const items = await listInventory();
        setStock(items);
      } catch (error) {
        console.error('Failed to load inventory stock:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">الرصيد الحالي</h1>
        <p className="text-gray-400">نظرة شاملة على الرصيد الحالي للمخزون</p>
      </div>
      <InventoryStockTable stock={stock} loading={loading} />
    </div>
  );
};

export default InventoryStock;
