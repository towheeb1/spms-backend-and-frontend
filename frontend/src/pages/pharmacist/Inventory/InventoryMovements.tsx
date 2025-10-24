import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { InventoryMovementsTable } from '../../../components/pharmacist/inventory/InventoryMovementsTable';

export interface InventoryMovement {
  id: number;
  medicine_id: number;
  qty_change: number;
  reason: string;
  created_at: string;
  medicine_name?: string;
  unit_type?: string | null;
  unit_label?: string | null;
  unit_qty?: number | null;
  base_qty_change?: number | null;
  balance_after_base?: number | null;
  ref_number?: string | null;
  ref_type?: string | null;
  ref_id?: number | null;
  notes?: string | null;
}

const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<{ list: InventoryMovement[] }>('/inventory/movements');
      setMovements(response.data.list || []);
    } catch (error) {
      console.error('Failed to load inventory movements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements, refreshCount]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'inventory_operation_completed') {
        setRefreshCount((prev) => prev + 1);
      }
    };

    const handleFocus = () => setRefreshCount((prev) => prev + 1);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    (window as any).refreshInventoryMovements = () => setRefreshCount((prev) => prev + 1);
    return () => {
      delete (window as any).refreshInventoryMovements;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">حركات المخزون</h1>
        <p className="text-gray-400">سجل مفصل لحركات المخزون والتعديلات</p>
        <div className="mt-2 flex items-center gap-3">
          <button
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            disabled={loading}
            onClick={() => setRefreshCount((prev) => prev + 1)}
          >
            {loading ? 'جارٍ التحديث...' : 'تحديث الحركات'}
          </button>
          <span className="text-xs text-gray-400">
            {movements.length > 0
              ? `آخر حركة عند ${new Date(movements[0].created_at).toLocaleString('ar-SA')}`
              : 'لا توجد حركات مسجلة'}
          </span>
        </div>
      </div>
      <InventoryMovementsTable movements={movements} loading={loading} />
    </div>
  );
};

export default InventoryMovements;
