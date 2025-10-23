// src/components/doctor-dashboard/RecentPrescriptions.tsx
import Card from "./Card";

export type RxRow = { prescription_id:number; full_name:string; created_at:string };

export default function RecentPrescriptions({ rows }: { rows: RxRow[] }) {
  return (
    <Card>
      <div className="font-semibold mb-2">أحدث الوصفات</div>
      <ul className="grid gap-2 text-sm">
        {rows.map((r) => (
          <li key={r.prescription_id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <span>#{r.prescription_id} • {r.full_name}</span>
            <span className="opacity-70">{new Date(r.created_at).toLocaleString()}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="opacity-60">لا بيانات.</li>}
      </ul>
    </Card>
  );
}
