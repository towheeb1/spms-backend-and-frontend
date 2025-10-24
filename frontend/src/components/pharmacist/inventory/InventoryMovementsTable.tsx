import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { DataTable } from '../../ui/DataTable';

interface InventoryMovement {
  id: number;
  medicine_id: number;
  qty_change: number;
  reason: string;
  created_at: string;
  medicine_name?: string;
  unit_type?: string;
  unit_label?: string;
  unit_qty?: number;
  base_qty_change?: number;
  balance_after_base?: number;
  ref_number?: string;
}

interface Props {
  movements: InventoryMovement[];
  loading: boolean; 
}

export function InventoryMovementsTable({ movements, loading }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const reasons = useMemo(() => {
    const uniqueReasons = Array.from(new Set(movements.map(m => m.reason)));
    return uniqueReasons;
  }, [movements]);

  const filteredMovements = useMemo(() => {
    let filtered = movements.filter(movement => {
      const matchesSearch = (movement.medicine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReason = reasonFilter === 'all' || movement.reason === reasonFilter;
      return matchesSearch && matchesReason;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [movements, searchTerm, reasonFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const totalMovements = movements.length;
    const totalIn = movements.filter(m => (m.base_qty_change ?? m.qty_change) > 0)
      .reduce((sum, m) => sum + (m.base_qty_change ?? m.qty_change), 0);
    const totalOut = Math.abs(movements.filter(m => (m.base_qty_change ?? m.qty_change) < 0)
      .reduce((sum, m) => sum + (m.base_qty_change ?? m.qty_change), 0));
    return { totalMovements, totalIn, totalOut };
  }, [movements]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }

  const columns = [
    {
      key: 'id',
      title: 'رقم الحركة',
      render: (row: InventoryMovement) => row.id
    },
    {
      key: 'medicine_name',
      title: 'الدواء',
      render: (row: InventoryMovement) => row.medicine_name || '—'
    },
    {
      key: 'unit',
      title: 'الوحدة',
      render: (row: InventoryMovement) => (
        <div className="text-sm">
          <div className="font-semibold">
            {row.unit_label || row.unit_type || '—'}
          </div>
          {row.unit_qty !== undefined && (
            <div className="text-xs text-white/60">كمية الوحدة: {row.unit_qty}</div>
          )}
        </div>
      )
    },
    {
      key: 'base_qty_change',
      title: 'التغيير (أساسي)',
      render: (row: InventoryMovement) => {
        const value = row.base_qty_change ?? row.qty_change;
        const isPositive = value >= 0;
        return (
          <div className="text-sm">
            <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
              {isPositive ? '+' : ''}{value}
            </span>
            {row.qty_change !== undefined && row.qty_change !== value && (
              <div className="text-xs text-white/60">سجل: {row.qty_change}</div>
            )}
          </div>
        );
      }
    },
    {
      key: 'balance_after_base',
      title: 'الرصيد بعد الحركة',
      render: (row: InventoryMovement) => (
        <div className="text-sm font-semibold text-white/80">
          {row.balance_after_base !== undefined ? row.balance_after_base : '—'}
        </div>
      )
    },
    {
      key: 'reason',
      title: 'السبب',
      render: (row: InventoryMovement) => row.reason || '—'
    },
    {
      key: 'created_at',
      title: 'التاريخ',
      render: (row: InventoryMovement) => new Date(row.created_at).toLocaleDateString('ar-SA')
    },
    {
      key: 'ref_number',
      title: 'مرجع',
      render: (row: InventoryMovement) => row.ref_number || '—'
    },
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي الحركات</p>
              <p className="text-2xl font-bold text-white">{stats.totalMovements}</p>
            </div>
            <div className="text-3xl">🔄</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي الوارد</p>
              <p className="text-2xl font-bold text-white">+{stats.totalIn}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/20 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي الصادر</p>
              <p className="text-2xl font-bold text-white">-{stats.totalOut}</p>
            </div>
            <div className="text-3xl">📉</div>
          </div>
        </Card>
      </div>

      {/* فلاتر */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث في الحركات..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500/50"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            >
              <option value="all">جميع الأسباب</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500/50"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
            >
              <option value="id-desc">الأحدث أولاً</option>
              <option value="id-asc">الأقدم أولاً</option>
              <option value="created_at-desc">التاريخ تنازلي</option>
              <option value="created_at-asc">التاريخ تصاعدي</option>
            </select>
          </div>
        </div>
      </Card>

      {/* جدول البيانات */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">سجل الحركات</h3>
          <p className="text-sm text-gray-400">عرض {filteredMovements.length} من {movements.length} حركة</p>
        </div>
        <DataTable columns={columns} rows={filteredMovements} />
      </Card>
    </div>
  );
}
