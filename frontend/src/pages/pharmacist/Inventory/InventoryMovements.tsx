import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { InventoryMovementsTable } from '../../../components/pharmacist/inventory/InventoryMovementsTable';

interface InventoryMovement {
  id: number;
  medicine_id: number;
  qty_change: number;
  reason: string;
  created_at: string;
  medicine_name?: string;
}

const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await api.get<{ list: InventoryMovement[] }>('/inventory/movements');
        setMovements(response.data.list || []);
      } catch (error) {
        console.error('Failed to load inventory movements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">حركات المخزون</h1>
        <p className="text-gray-400">سجل مفصل لحركات المخزون والتعديلات</p>
      </div>
      <InventoryMovementsTable movements={movements} loading={loading} />
    </div>
  );
};

export default InventoryMovements;
