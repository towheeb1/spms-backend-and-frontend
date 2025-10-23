import React from "react";
import { Card } from "../../ui/Card";

export type Movement = {
  id: number;
  created_at: string;
  reason: string;
  qty_change: number;
  medicine_name: string;
};

type Props = { items: Movement[] };

export function RecentMovements({ items }: Props) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">التحركات الأخيرة</h2>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center opacity-70">لا توجد تحركات</div>
        )}
        {items.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <div className="font-medium">{m.medicine_name}</div>
              <div className="text-xs opacity-70">{new Date(m.created_at).toLocaleString('ar-SA')}</div>
            </div>
            <div className="text-sm">
              <span className={`px-2 py-1 rounded-full ${m.qty_change >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {m.qty_change > 0 ? `+${m.qty_change}` : m.qty_change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
