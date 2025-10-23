// src/components/inventory/InventoryAlerts.tsx
import { Button } from '../../ui/Button';
import { Med } from './types';

interface Props {
  lowStock: Med[];
  nearExpiry: Med[];
  expired: Med[];
  updateField: (id: number | undefined, patch: Partial<Med>) => void;
}

export default function InventoryAlerts({ lowStock, nearExpiry, expired, updateField }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* مخزون منخفض */}
        <div className="card rounded-2xl p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-lg font-semibold">تنبيهات المخزون المنخفض</h3>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-center py-8 text-green-300">
              <div className="text-4xl mb-2">✅</div>
              <p>جميع العناصر في مستوى مخزون جيد</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {lowStock.slice(0, 10).map(med => (
                <div key={med.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{med.trade_name}</div>
                      <div className="text-sm opacity-80">
                        الكمية الحالية: <span className="font-semibold text-orange-300">{med.qty ?? 0}</span>
                      </div>
                    </div>
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">منخفض</span>
                  </div>
                  {med.min_stock && <div className="text-xs opacity-70 mt-1">الحد الأدنى: {med.min_stock}</div>}
                </div>
              ))}
              {lowStock.length > 10 && <div className="text-center text-sm opacity-70">+ {lowStock.length - 10} عنصر إضافي</div>}
            </div>
          )}
        </div>

        {/* انتهاء قريب */}
        <div className="card rounded-2xl p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📅</div>
            <h3 className="text-lg font-semibold">تنبيهات الانتهاء القريب</h3>
          </div>
          {nearExpiry.length === 0 ? (
            <div className="text-center py-8 text-green-300">
              <div className="text-4xl mb-2">✅</div>
              <p>لا توجد عناصر قرب انتهاء صلاحيتها</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {nearExpiry.slice(0, 10).map(med => {
                const days = med.expiry ? Math.ceil((new Date(med.expiry + 'T00:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                return (
                  <div key={med.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{med.trade_name}</div>
                        <div className="text-sm opacity-80">ينتهي في: <span className="font-semibold text-yellow-300">{med.expiry} ({days} يوم)</span></div>
                      </div>
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">قريب الانتهاء</span>
                    </div>
                    {med.batch_number && <div className="text-xs opacity-70 mt-1">دفعة: {med.batch_number}</div>}
                  </div>
                );
              })}
              {nearExpiry.length > 10 && <div className="text-center text-sm opacity-70">+ {nearExpiry.length - 10} عنصر إضافي</div>}
            </div>
          )}
        </div>
      </div>

      {/* منتهي الصلاحية */}
      {expired.length > 0 && (
        <div className="card rounded-2xl p-5 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">❌</div>
            <h3 className="text-lg font-semibold">عناصر منتهية الصلاحية</h3>
            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">{expired.length} عنصر</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expired.slice(0, 6).map(med => (
              <div key={med.id} className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{med.trade_name}</div>
                    <div className="text-sm opacity-90">انتهى في: <span className="font-semibold">{med.expiry}</span></div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => updateField(med.id, { qty: 0 })} className="text-red-300 hover:text-white">حذف</Button>
                </div>
                <div className="text-xs opacity-80 mt-2">الكمية: {med.qty ?? 0}</div>
              </div>
            ))}
            {expired.length > 6 && (
              <div className="flex items-center justify-center p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <div className="text-center">
                  <div className="text-lg font-semibold">+{expired.length - 6}</div>
                  <div className="text-xs opacity-80">عنصر إضافي</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}