import { Fragment, useState } from 'react';
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
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
                const hasDetails = !!(med.items && med.items.length);
                const isExpanded = expandedId === med.id;
                return (
                  <Fragment key={med.id}>
                    <tr className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-blue-500/10' : ''}`}>
                      <td className="py-3 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectItem(med.id || 0, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">{med.trade_name}</div>
                            <div className="text-xs opacity-70">
                              {med.barcode ? `باركود: ${med.barcode}` : ''}
                              {med.batch_number ? ` • دفعة: ${med.batch_number}` : ''}
                            </div>
                            {med.category && <div className="text-xs text-blue-300 mt-1">{med.category}</div>}
                          </div>
                          {hasDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedId(isExpanded ? null : (med.id ?? null))}
                              className="text-xs"
                            >
                              {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div className="font-semibold">{med.qty ?? 0}</div>
                        {med.items && med.items.length > 0 && (
                          <div className="text-[11px] opacity-70">من {med.items.length} دفعة</div>
                        )}
                      </td>
                      <td className="py-3 align-top">
                        <div className={`font-medium ${isExpired(med.expiry, med.nearest_expiry) ? 'text-red-400' : ''}`}>
                          {formatExpiryDate(med.expiry, med.nearest_expiry)}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div className="font-semibold">{typeof med.price === 'number' ? med.price.toFixed(2) : (Number(med.price) || 0).toFixed(2)}</div>
                        {med.items?.[0]?.unit && (
                          <div className="text-[11px] opacity-70">سعر للوحدة: {med.items[0].unit}</div>
                        )}
                        {med.items?.[0]?.supplier_name && (
                          <div className="text-[11px] opacity-70">آخر مورد: {med.items[0].supplier_name}</div>
                        )}
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
                    {hasDetails && isExpanded && (
                      <tr className="bg-white/5">
                        <td></td>
                        <td colSpan={6} className="py-3">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs sm:text-sm">
                            <div className="mb-2 font-semibold">تفاصيل الموردين والدفعات:</div>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {med.items?.map((detail, idx) => (
                                <div key={`${detail.id || idx}-${detail.batch_no || idx}`} className="rounded-lg border border-white/10 bg-white/5 p-2">
                                  <div className="flex flex-wrap justify-between gap-2">
                                    <div>
                                      <div className="font-medium">{detail.item_name || med.trade_name}</div>
                                      {detail.supplier_name && (
                                        <div className="text-[11px] opacity-70">المورد: {detail.supplier_name}</div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[11px] opacity-70">سعر الوحدة</div>
                                      <div>{Number(detail.unit_price || 0).toFixed(2)}</div>
                                    </div>
                                  </div>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    <div>الكمية: <span className="font-semibold">{detail.quantity ?? 0} {detail.unit || ''}</span></div>
                                    <div>الدفعة: <span className="font-semibold">{detail.batch_no || '-'}</span></div>
                                    <div>تاريخ الانتهاء: <span className="font-semibold">{
                                      detail.expiry_date
                                        ? formatExpiryDate(detail.expiry_date)
                                        : formatExpiryDate(undefined, med.nearest_expiry)
                                    }</span></div>
                                  </div>
                                  <div className="mt-1 grid gap-2 sm:grid-cols-3 text-[11px] opacity-70">
                                    <div>رقم الشراء: {detail.id ?? '-'}</div>
                                    <div>تاريخ الطلب: {detail.order_date ? new Date(detail.order_date).toLocaleDateString('ar-SA') : '—'}</div>
                                    <div>الحالة: {detail.status || 'غير محدد'}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
