// src/components/inventory/InventoryFilters.tsx
import { StatusFilter, SortBy } from './types';
import { Select } from '../../ui/Select';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  categories: string[];
}

export default function InventoryFilters({
  searchTerm, onSearchChange, categoryFilter, onCategoryChange,
  statusFilter, onStatusChange, sortBy, onSortByChange,
  sortOrder, onSortOrderToggle, categories
}: Props) {
  return (
    <div className="card rounded-2xl p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <label className="text-xs opacity-70 block mb-2">بحث</label>
          <div className="relative">
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-2">الفئة</label>
          <Select
            value={categoryFilter}
            onChange={(v) => onCategoryChange(String(v))}
            options={[{ label: 'جميع الفئات', value: 'all' }, ...categories.map(cat => ({ label: cat, value: cat }))]}
          />
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-2">الحالة</label>
          <Select
            value={statusFilter}
            onChange={(v) => onStatusChange(v as StatusFilter)}
            options={[
              { label: 'جميع الحالات', value: 'all' },
              { label: 'جيد', value: 'good' },
              { label: 'مخزون منخفض', value: 'low_stock' },
              { label: 'نفاذ المخزون', value: 'critical_stock' },
              { label: 'قريب الانتهاء', value: 'near_expiry' },
              { label: 'منتهي الصلاحية', value: 'expired' },
            ]}
          />
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-2">ترتيب حسب</label>
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(v) => onSortByChange(v as SortBy)}
              options={[
                { label: 'الاسم', value: 'name' },
                { label: 'الكمية', value: 'qty' },
                { label: 'تاريخ الانتهاء', value: 'expiry' },
                { label: 'السعر', value: 'price' },
              ]}
              className="flex-1"
            />
            <button
              onClick={onSortOrderToggle}
              className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}