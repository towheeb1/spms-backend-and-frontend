// =============================================================
// File: src/components/doctor-login/NearbyPharmaciesSelector.tsx
// =============================================================
import { useState } from "react";
import { Button } from "../../ui/Button";
import { DoctorProfilePayload } from "./types";
import { listNearbyPharmacies } from "../../../services/doctorApi";

export default function NearbyPharmaciesSelector({ value, onChange }: { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void }) {
  const [loading, setLoading] = useState(false);
  const [nearby, setNearby] = useState<{ id: number; name: string; distance_km: number }[]>([]);

  const search = async () => {
    if (!value.location) { alert("الرجاء تحديد الموقع أولًا"); return; }
    setLoading(true);
    try {
      const list = await listNearbyPharmacies(value.location.lat, value.location.lng);
      setNearby(list);
    } finally { setLoading(false); }
  };

  const toggle = (id: number, checked: boolean) => {
    const arr = new Set(value.preferred_pharmacies || []);
    checked ? arr.add(id) : arr.delete(id);
    onChange({ ...value, preferred_pharmacies: Array.from(arr) });
  };

  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">الصيدليات القريبة (اختياري)</div>
        <Button variant="outline" loading={loading} onClick={search}>بحث حسب موقعي</Button>
      </div>
      <div className="grid gap-2">
        {nearby.length > 0 ? (
          <ul className="grid gap-2">
            {nearby.map((p) => (
              <label key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                <input type="checkbox" checked={!!value.preferred_pharmacies?.includes(p.id)} onChange={(e) => toggle(p.id, e.target.checked)} />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs opacity-70">يبعد تقريبًا {p.distance_km.toFixed(1)} كم</div>
                </div>
              </label>
            ))}
          </ul>
        ) : (
          <div className="text-xs opacity-70">لا توجد نتائج بعد.</div>
        )}
      </div>
    </section>
  );
}
