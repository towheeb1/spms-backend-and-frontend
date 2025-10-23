// src/components/medicines/MedicinesStats.tsx
import { Med } from './types';

interface Props {
  items: Med[];
}

export default function MedicinesStats({ items }: Props) {
  const available = items.filter(m => (m.stock || 0) > (m.min_stock || 0)).length;
  const lowStock = items.filter(m => (m.stock || 0) <= (m.min_stock || 0)).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card rounded-2xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm text-blue-300">إجمالي الأدوية</div>
          </div>
          <div className="text-3xl">💊</div>
        </div>
      </div>
      
      <div className="card rounded-2xl p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{available}</div>
            <div className="text-sm text-green-300">متوفرة</div>
          </div>
          <div className="text-3xl">✅</div>
        </div>
      </div>
      
      <div className="card rounded-2xl p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{lowStock}</div>
            <div className="text-sm text-red-300">تحتاج إعادة توريد</div>
          </div>
          <div className="text-3xl">⚠️</div>
        </div>
      </div>
    </div>
  );
}