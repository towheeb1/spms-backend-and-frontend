import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { DataTable } from '../../ui/DataTable';
import { Button } from '../../ui/Button';

interface InventoryItem {
  id: number;
  trade_name: string;
  category?: string;
  qty: number;
  price: number;
  nearest_expiry?: string;
}

interface Props {
  stock: InventoryItem[];
  loading: boolean;
}

export function InventoryStockTable({ stock, loading }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'trade_name' | 'qty' | 'price'>('trade_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stock.map(item => item.category).filter(Boolean)));
    return cats;
  }, [stock]);

  const filteredStock = useMemo(() => {
    let filtered = stock.filter(item => {
      const matchesSearch = item.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'trade_name':
          comparison = a.trade_name.localeCompare(b.trade_name);
          break;
        case 'qty':
          comparison = a.qty - b.qty;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [stock, searchTerm, categoryFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const totalItems = stock.length;
    const totalValue = stock.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const lowStock = stock.filter(item => item.qty < 10).length;
    return { totalItems, totalValue, lowStock };
  }, [stock]);

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
      key: 'trade_name',
      title: 'الاسم التجاري',
      render: (row: InventoryItem) => String(row.trade_name || '')
    },
    {
      key: 'category',
      title: 'الفئة',
      render: (row: InventoryItem) => String(row.category || '')
    },
    {
      key: 'qty',
      title: 'الكمية',
      render: (row: InventoryItem) => (
        <span className={(row.qty ?? 0) < 10 ? 'text-red-400 font-semibold' : ''}>{row.qty ?? 0}</span>
      )
    },
    {
      key: 'price',
      title: 'السعر',
      render: (row: InventoryItem) => `${Number(row.price || 0).toFixed(2)} ريال`
    },
    {
      key: 'nearest_expiry',
      title: 'تاريخ الانتهاء',
      render: (row: InventoryItem) => row.nearest_expiry ? new Date(row.nearest_expiry).toLocaleDateString('ar-SA') : 'غير محدد'
    },
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">إجمالي الأصناف</p>
              <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">القيمة الإجمالية</p>
              <p className="text-2xl font-bold text-white">{stats.totalValue.toLocaleString()} ريال</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/20 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">مخزون منخفض</p>
              <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </Card>
      </div>

      {/* فلاتر */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث في الأصناف..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500/50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
              <option value="trade_name-asc">الاسم تصاعدي</option>
              <option value="trade_name-desc">الاسم تنازلي</option>
              <option value="qty-asc">الكمية تصاعدي</option>
              <option value="qty-desc">الكمية تنازلي</option>
              <option value="price-asc">السعر تصاعدي</option>
              <option value="price-desc">السعر تنازلي</option>
            </select>
          </div>
        </div>
      </Card>

      {/* جدول البيانات */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">قائمة الأصناف</h3>
          <p className="text-sm text-gray-400">عرض {filteredStock.length} من {stock.length} صنف</p>
        </div>
        <DataTable columns={columns} rows={filteredStock} />
      </Card>
    </div>
  );
}
