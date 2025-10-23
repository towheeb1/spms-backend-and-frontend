// src/components/inventory/InventoryPage.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Med, SortBy, StatusFilter } from './types';
import InventoryFilters from './InventoryFilters';
import InventoryStats from './InventoryStats';
import InventoryTable from './InventoryTable';
import InventoryAlerts from './InventoryAlerts';
import InventoryBulkActions from './InventoryBulkActions';
import { listInventory, stockIn, stockOut, deleteManyMedicines } from '../../../services/inventory';
import { deleteMedicine } from '../../../services/medicines';

export const LOW_STOCK_THRESHOLD = 10;
export const NEAR_EXPIRY_DAYS = 30;
export const CRITICAL_STOCK_THRESHOLD = 5;

const normalizeDateValue = (value?: string | null) => {
  if (!value) return undefined;
  const str = String(value);
  return str.includes('T') ? str.split('T')[0] : str;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Med[]>([]);
  const [filteredItems, setFilteredItems] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<'none' | 'update' | 'delete'>('none');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await listInventory();
      const mapped: Med[] = rows.map(r => {
        const details = r.items || [];
        const nearestFromRow = normalizeDateValue(r.nearest_expiry);
        const expiryFromItems = details
          .map((detail) => normalizeDateValue(detail.expiry_date))
          .filter((date): date is string => typeof date === 'string' && !!date)
          .sort((a, b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());
        const computedExpiry = nearestFromRow || expiryFromItems[0] || undefined;
        const firstDetail = details.length > 0 ? details[0] : undefined;
        return {
          id: r.id,
          trade_name: r.trade_name,
          category: r.category || undefined,
          qty: r.qty,
          price: r.price,
          expiry: computedExpiry,
          nearest_expiry: computedExpiry,
          barcode: firstDetail?.barcode || undefined,
          batch_number: firstDetail?.batch_no || undefined,
          min_stock: r.min_stock || 0,
          last_updated: r.last_updated,
          items: details,
        };
      });
      setItems(mapped);
      const uniqueCategories = Array.from(new Set(mapped.map(m => m.category).filter(Boolean))) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateField = useCallback(async (id: number | undefined, patch: Partial<Med>) => {
    if (!id) return;
    try {
      // Only qty updates are supported via stock in/out
      if (typeof patch.qty === 'number') {
        const current = items.find(i => i.id === id);
        if (!current) return;
        const delta = patch.qty - (current.qty || 0);
        if (delta > 0) {
          await stockIn(id, delta);
        } else if (delta < 0) {
          await stockOut(id, Math.abs(delta));
        }
      }
      await loadData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }, [items, loadData]);

  const handleDeleteItem = useCallback(async (id: number | undefined) => {
    if (!id) return;
    if (!confirm('هل تريد حذف هذا المنتج من المخزون؟')) return;
    try {
      await deleteMedicine(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('فشل في حذف المنتج من المخزون');
    }
  }, [loadData]);

  const isNearExpiry = useCallback((expiry?: string, fallback?: string) => {
    const value = normalizeDateValue(expiry) || normalizeDateValue(fallback);
    if (!value) return false;
    const d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= NEAR_EXPIRY_DAYS;
  }, []);

  const isExpired = useCallback((expiry?: string, fallback?: string) => {
    const value = normalizeDateValue(expiry) || normalizeDateValue(fallback);
    if (!value) return false;
    const d = new Date(value + 'T00:00:00');
    return !isNaN(d.getTime()) && d.getTime() < new Date().getTime();
  }, []);

  useEffect(() => {
    let filtered = [...items];
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.barcode?.includes(searchTerm) ||
        m.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.items || []).some((it) =>
          (it.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (it.batch_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (it.barcode || '').includes(searchTerm)
        )
      );
    }
    if (categoryFilter !== 'all') filtered = filtered.filter(m => m.category === categoryFilter);
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => {
        const qty = m.qty || 0;
        const near = isNearExpiry(m.expiry, m.nearest_expiry);
        const expired = isExpired(m.expiry, m.nearest_expiry);
        switch (statusFilter) {
          case 'low_stock': return qty < (m.min_stock || LOW_STOCK_THRESHOLD);
          case 'critical_stock': return qty < CRITICAL_STOCK_THRESHOLD;
          case 'near_expiry': return near && !expired;
          case 'expired': return expired;
          case 'good': return qty >= (m.min_stock || LOW_STOCK_THRESHOLD) && !near && !expired;
          default: return true;
        }
      });
    }
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name': cmp = (a.trade_name || '').localeCompare(b.trade_name || ''); break;
        case 'qty': cmp = (a.qty || 0) - (b.qty || 0); break;
        case 'expiry': cmp = (a.expiry ? new Date(a.expiry).getTime() : 0) - (b.expiry ? new Date(b.expiry).getTime() : 0); break;
        case 'price': cmp = (a.price || 0) - (b.price || 0); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    setFilteredItems(filtered);
  }, [items, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, isNearExpiry, isExpired]);

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id || 0).filter(id => id !== undefined));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.length === 0) return;
    const newQty = prompt('أدخل الكمية الجديدة لكل عنصر مختار:');
    if (!newQty || isNaN(Number(newQty))) return;
    const qtyValue = Number(newQty);
    for (const id of selectedItems) {
      await updateField(id, { qty: qtyValue });
    }
    setSelectedItems([]);
    setBulkAction('none');
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm('هل تريد حذف العناصر المختارة من المخزون؟ سيتم حذف البيانات المرتبطة بها.')) return;
    try {
      await deleteManyMedicines(selectedItems);
      await loadData();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('فشل حذف العناصر. تحقق من السجلات لمعرفة التفاصيل.');
    } finally {
      setSelectedItems([]);
      setBulkAction('none');
    }
  };

  const lowStock = useMemo(() => items.filter(m => (m.qty ?? 0) < (m.min_stock || LOW_STOCK_THRESHOLD)), [items]);
  const nearExpiry = useMemo(() => items.filter(m => isNearExpiry(m.expiry, m.nearest_expiry)), [items, isNearExpiry]);
  const expired = useMemo(() => items.filter(m => isExpired(m.expiry, m.nearest_expiry)), [items, isExpired]);
  const criticalStock = useMemo(() => items.filter(m => (m.qty ?? 0) < CRITICAL_STOCK_THRESHOLD), [items]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-gray-400 mt-1">تتبع وتحديث المخزون والأدوية</p>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">إجمالي العناصر:</span>
          <span className="font-semibold text-white ml-2">{items.length}</span>
        </div>
      </div>

      <InventoryStats items={items} lowStock={lowStock} nearExpiry={nearExpiry} expired={expired} criticalStock={criticalStock} />
      
      <InventoryFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        sortBy={sortBy} onSortByChange={setSortBy}
        sortOrder={sortOrder} onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        categories={categories}
      />

      {selectedItems.length > 0 && (
        <InventoryBulkActions
          selectedItems={selectedItems}
          filteredItems={filteredItems}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedItems([])}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          bulkAction={bulkAction}
          onBulkActionChange={setBulkAction}
        />
      )}

      <InventoryTable
        items={filteredItems}
        totalItems={items.length}
        updateField={updateField}
        isExpired={isExpired}
        isNearExpiry={isNearExpiry}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onDelete={handleDeleteItem}
      />

      <InventoryAlerts lowStock={lowStock} nearExpiry={nearExpiry} expired={expired} updateField={updateField} />
    </div>
  );
}