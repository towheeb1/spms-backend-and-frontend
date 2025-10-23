// src/components/doctor-dashboard/MiniBars.tsx
import Card from "./Card";

export type TrendItem = { label: string; value: number };

export default function MiniBars({ data }: { data: TrendItem[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card>
      <div className="font-semibold mb-2">زيارات آخر 6 أشهر</div>
      <div className="flex items-end gap-2 h-28">
        {data.map((d) => (
          <div key={d.label} className="flex-1">
            <div className="w-full rounded-t bg-blue-500" style={{ height: `${(d.value / max) * 100}%` }} />
            <div className="text-[10px] opacity-70 text-center mt-1">{d.label}</div>
          </div>
        ))}
      </div>
      {data.length === 0 && <div className="opacity-60 text-sm mt-2">لا بيانات.</div>}
    </Card>
  );
}
