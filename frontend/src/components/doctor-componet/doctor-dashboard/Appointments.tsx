// src/components/doctor-dashboard/Appointments.tsx
import Card from "./Card";

export type VisitRow = { visit_id:number; full_name:string; visit_reason?:string; visit_date:string };

export default function Appointments({ rows }: { rows: VisitRow[] }) {
  return (
    <Card>
      <div className="font-semibold mb-2">المواعيد القادمة</div>
      <table className="w-full text-sm">
        <thead className="opacity-70">
          <tr>
            <th className="text-right py-2">المريض</th>
            <th className="text-right">السبب</th>
            <th className="text-right">الوقت</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.visit_id} className="border-t border-white/10">
              <td className="py-2">{v.full_name}</td>
              <td>{v.visit_reason || "—"}</td>
              <td>{new Date(v.visit_date).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-3 opacity-60">لا توجد مواعيد.</td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
