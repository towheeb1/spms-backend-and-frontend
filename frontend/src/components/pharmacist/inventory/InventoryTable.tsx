import { useState } from 'react';
import { Med } from './types';
import { LOW_STOCK_THRESHOLD, CRITICAL_STOCK_THRESHOLD } from './InventoryPage';
import { Button } from '../../ui/Button';

interface Props {
  items: Med[];
  totalItems: number;
  updateField: (id: number | undefined, patch: Partial<Med>) => void;
  isExpired: (expiry?: string, fallback?: string) => boolean;
  isNearExpiry: (expiry?: string, fallback?: string) => boolean;
  selectedItems: number[];
  onSelectItem: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (id: number | undefined) => void;
  highlightId?: number | null;
}

export default function InventoryTable({
  items,
  totalItems,
  updateField,
  isExpired,
  isNearExpiry,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onDelete,
  highlightId = null,
}: Props) {
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const getStockStatus = (med: Med) => {
    const qty = med.qty || 0;
    const minStock = med.min_stock || LOW_STOCK_THRESHOLD;
    const exp = med.expiry || med.nearest_expiry;
    if (isExpired(exp)) return { color: 'bg-red-500/20 text-red-300', label: 'منتهي' };
    if (qty <= CRITICAL_STOCK_THRESHOLD) return { color: 'bg-red-500/20 text-red-300', label: 'نفاذ' };
    if (qty < minStock) return { color: 'bg-orange-500/20 text-orange-300', label: 'منخفض' };
    if (isNearExpiry(exp)) return { color: 'bg-yellow-500/20 text-yellow-300', label: 'قريب الانتهاء' };
    return { color: 'bg-green-500/20 text-green-300', label: 'جيد' };
  };

  const normalizeDateString = (value?: string) => {
    if (!value) return undefined;
    return value.includes('T') ? value.split('T')[0] : value;
  };

  const formatExpiryDate = (expiry?: string, fallback?: string) => {
    const value = normalizeDateString(expiry) || normalizeDateString(fallback);
    if (!value) return '—';
    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) return expiry;
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return `منتهي منذ ${Math.abs(Math.floor(diff))} يوم`;
    if (diff <= 7) return `ينتهي بعد ${Math.floor(diff)} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">قائمة المخزون</h2>
        <div className="text-sm text-gray-400">عرض {items.length} من أصل {totalItems} عنصر</div>
      </div>

      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 text-sm font-medium w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="pb-3 text-sm font-medium">الاسم</th>
                <th className="pb-3 text-sm font-medium">الكمية</th>
                <th className="pb-3 text-sm font-medium">تاريخ الانتهاء</th>
                <th className="pb-3 text-sm font-medium">السعر</th>
                <th className="pb-3 text-sm font-medium">الحالة</th>
                <th className="pb-3 text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map(med => {
                const status = getStockStatus(med);
                const isSelected = selectedItems.includes(med.id || 0);
                const isHighlighted = highlightId != null && med.id === highlightId;
                return (
                  <tr
                    key={med.id}
                    id={`inventory-row-${med.id}`}
                    className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-blue-500/10' : ''} ${
                      isHighlighted ? 'bg-sky-500/10 ring-2 ring-sky-400/80' : ''
                    }`}
                  >
                      <td className="py-3 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectItem(med.id || 0, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 align-top">
                        <div>
                          <div className="font-medium">{med.trade_name}</div>
                          <div className="text-xs opacity-70">
                            {med.barcode ? `باركود: ${med.barcode}` : ''}
                            {med.batch_number ? ` • دفعة: ${med.batch_number}` : ''}
                          </div>
                          {med.category && <div className="text-xs text-blue-300 mt-1">{med.category}</div>}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div className="font-semibold">{med.qty ?? 0}</div>
                      </td>
                      <td className="py-3 align-top">
                        <div className={`font-medium ${isExpired(med.expiry, med.nearest_expiry) ? 'text-red-400' : ''}`}>
                          {formatExpiryDate(med.expiry, med.nearest_expiry)}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div className="font-semibold">{typeof med.price === 'number' ? med.price.toFixed(2) : (Number(med.price) || 0).toFixed(2)}</div>
                      </td>
                      <td className="py-3 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="py-3 align-top">
                        {(!med.qty || Number(med.qty) === 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(med.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            ×
                          </Button>
                        )}
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">لا توجد عناصر في المخزون</h3>
          <p className="text-gray-400 mb-4">ابدأ بإضافة عنصر جديد للمخزون</p>
        </div>
      )}
    </div>
  );
}
