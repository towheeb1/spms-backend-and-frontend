import React from "react";
import { Card } from "../../ui/Card";

export type KPIData = {
  medicines: number;
  lowStock: number;
  suppliers: number;
  salesToday: number;
};

type Props = { kpis: KPIData };

export function KPIGrid({ kpis }: Props) {
  const items = [
    { label: "إجمالي الأدوية", value: kpis.medicines, color: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/30", icon: "💊" },
    { label: "مخزون منخفض", value: kpis.lowStock, color: "from-red-500/20 to-red-600/20", border: "border-red-500/30", icon: "📉" },
    { label: "الموردون", value: kpis.suppliers, color: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/30", icon: "🏢" },
    { label: "مبيعات اليوم", value: kpis.salesToday, color: "from-green-500/20 to-green-600/20", border: "border-green-500/30", icon: "💰" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s, i) => (
        <Card key={i} className={`bg-gradient-to-br ${s.color} ${s.border} hover:scale-[1.02] transition-transform`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="opacity-80 text-sm mb-1">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
            <div className="text-3xl">{s.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
