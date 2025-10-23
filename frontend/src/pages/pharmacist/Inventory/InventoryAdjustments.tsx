import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { InventoryAdjustmentsTable } from '../../../components/pharmacist/inventory/InventoryAdjustmentsTable';

interface InventoryAdjustment {
  id: number;
  medicine_id: number;
  qty_change: number;
  reason: string;
  created_at: string;
  medicine_name?: string;
}

const InventoryAdjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const response = await api.get<{ list: InventoryAdjustment[] }>('/inventory/movements');
        setAdjustments(response.data.list || []);
      } catch (error) {
        console.error('Failed to load inventory adjustments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustments();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">تعديلات المخزون</h1>
        <p className="text-gray-400">عرض جميع التعديلات اليدوية على المخزون</p>
      </div>
      <InventoryAdjustmentsTable adjustments={adjustments} loading={loading} />
    </div>
  );
};

export default InventoryAdjustments;
