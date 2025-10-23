// src/components/doctor-dashboard/PatientsList.tsx
import Card from "./Card";
import { absoluteApiUrl } from "../../../utils/url";

export type PatientRow = { id:number; full_name:string; avatar_url?:string; gender?:string; date_of_birth?:string };

export default function PatientsList({ rows }: { rows: PatientRow[] }) {
  return (
    <Card>
      <div className="font-semibold mb-2">مرضى حديثون</div>
      <ul className="grid gap-2">
        {rows.map((p) => (
          <li key={p.id} className="rounded-xl px-3 py-2 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                className="h-10 w-10 rounded-full object-cover bg-white/10"
                src={p.avatar_url ? absoluteApiUrl(p.avatar_url) : "/avatar.svg"}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/avatar.svg"; }}
                alt=""
              />
              <div>
                <div className="font-medium">{p.full_name}</div>
                <div className="text-xs opacity-70">
                  {p.gender || "—"} {p.date_of_birth ? `• ${p.date_of_birth}` : ""}
                </div>
              </div>
            </div>
            <a href={`/patient?pid=${p.id}`} className="text-xs px-2 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600">
              ملف
            </a>
          </li>
        ))}
        {rows.length === 0 && <li className="opacity-60 text-sm">لا بيانات.</li>}
      </ul>
    </Card>
  );
}
