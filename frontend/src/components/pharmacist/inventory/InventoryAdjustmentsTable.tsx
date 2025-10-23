import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { DataTable } from '../../ui/DataTable';

interface InventoryAdjustment {
  id: number;
  medicine_id: number;
  qty_change: number;
  reason: string;
  created_at: string;
  medicine_name?: string;
}

interface Props {
  adjustments: InventoryAdjustment[];
  loading: boolean;
}

export function InventoryAdjustmentsTable({ adjustments, loading }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const reasons = useMemo(() => {
    const uniqueReasons = Array.from(new Set(adjustments.map(a => a.reason)));
    return uniqueReasons;
  }, [adjustments]);

  const filteredAdjustments = useMemo(() => {
    let filtered = adjustments.filter(adjustment => {
      const matchesSearch = (adjustment.medicine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReason = reasonFilter === 'all' || adjustment.reason === reasonFilter;
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
  }, [adjustments, searchTerm, reasonFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const totalAdjustments = adjustments.length;
    const totalIn = adjustments.filter(a => a.qty_change > 0).reduce((sum, a) => sum + a.qty_change, 0);
    const totalOut = Math.abs(adjustments.filter(a => a.qty_change < 0).reduce((sum, a) => sum + a.qty_change, 0));
    return { totalAdjustments, totalIn, totalOut };
  }, [adjustments]);

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
    { key: 'id', title: 'رقم التعديل' },
    { key: 'medicine_name', title: 'الدواء' },
    { key: 'qty_change', title: 'التغيير في الكمية', render: (value: number) => (
      <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
        {value > 0 ? '+' : ''}{value}
      </span>
    )},
    { key: 'reason', title: 'السبب' },
    { key: 'created_at', title: 'التاريخ', render: (value: string) => new Date(value).toLocaleDateString('ar-SA') },
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي التعديلات</p>
              <p className="text-2xl font-bold text-white">{stats.totalAdjustments}</p>
            </div>
            <div className="text-3xl">⚖️</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي الزيادة</p>
              <p className="text-2xl font-bold text-white">+{stats.totalIn}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/20 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي النقصان</p>
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
              placeholder="البحث في التعديلات..."
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
          <h3 className="text-lg font-semibold text-white">سجل التعديلات</h3>
          <p className="text-sm text-gray-400">عرض {filteredAdjustments.length} من {adjustments.length} تعديل</p>
        </div>
        <DataTable columns={columns} rows={filteredAdjustments} />
      </Card>
    </div>
  );
}
