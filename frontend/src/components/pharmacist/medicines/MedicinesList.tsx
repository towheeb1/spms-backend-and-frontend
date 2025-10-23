// src/components/medicines/MedicinesList.tsx
import { Button } from '../../ui/Button';
import { Med } from './types';

interface Props {
  items: Med[];
  totalItems: number;
  onEdit: (item: Med) => void;
  onDelete: (id?: number) => void;
  getStockStatus: (stock?: number, minStock?: number) => { status: string; color: string } | null;
  onAddNew: () => void;
  searchTerm: string;
  categoryFilter: string;
}

export default function MedicinesList({
  items,
  totalItems,
  onEdit,
  onDelete,
  getStockStatus,
  onAddNew,
  searchTerm,
  categoryFilter
}: Props) {
  return (
    <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">قائمة الأدوية</h2>
        <div className="text-sm text-gray-400">
          عرض {items.length} من أصل {totalItems} دواء
        </div>
      </div>

      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 text-sm font-medium">الاسم</th>
                <th className="pb-3 text-sm font-medium">السعر</th>
                <th className="pb-3 text-sm font-medium">الباركود</th>
                <th className="pb-3 text-sm font-medium">الفئة</th>
                <th className="pb-3 text-sm font-medium">المخزون</th>
                <th className="pb-3 text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((med) => {
                // med.stock / med.min_stock may be null in the API shape; pass undefined instead of null
                const stockStatus = getStockStatus(med.stock ?? undefined, med.min_stock ?? undefined);
                return (
                  <tr key={med.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <div className="font-medium">{med.trade_name || med.name || '—'}</div>
                      {(med.manufacturer || med.generic_name) && (
                        <div className="text-xs opacity-70">{med.manufacturer || med.generic_name}</div>
                      )}
                      {med.dosage && (
                        <div className="text-xs text-blue-300">{med.dosage}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="font-medium">
                        {typeof med.price === 'number' ? new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(med.price) : '—'}
                      </div>
                    </td>
                    <td className="py-3 text-sm opacity-80">
                      {med.barcode || '—'}
                    </td>
                    <td className="py-3 text-sm">
                      {med.category ? (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                          {med.category}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3">
                      {stockStatus ? (
                        <div className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                            {typeof med.stock === 'number' ? `${med.stock} وحدة` : '—'}
                          </div>
                      ) : (
                        <span className="text-xs opacity-70">—</span>
                      )}
                      {med.min_stock && med.min_stock > 0 && (
                        <div className="text-xs opacity-70 mt-1">
                          الحد الأدنى: {med.min_stock}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(med)} className="px-3">
                          تعديل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDelete(med.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"
                          aria-label={`حذف ${med.trade_name || ''}`}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💊</div>
          <h3 className="text-xl font-semibold mb-2">لا توجد أدوية</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? "لا توجد أدوية تطابق معايير البحث" 
              : "ابدأ بإضافة دواء جديد"}
          </p>
          <Button onClick={onAddNew} className="px-6">
            إضافة دواء جديد
          </Button>
        </div>
      )}
    </div>
  );
}