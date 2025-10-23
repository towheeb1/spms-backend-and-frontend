// src/components/doctor-dashboard/KPIStat.tsx
import Card from "./Card";

export type KPI = { label: string; value: number; hint?: string };

export default function KPIStat({ label, value, hint }: KPI) {
  return (
    <Card>
      <div className="opacity-70 text-sm">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      {hint && <div className="text-xs opacity-60 mt-1">{hint}</div>}
    </Card>
  );
}
