// src/components/doctor-login/DoctorSpecialtiesPicker.tsx
import { useEffect, useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { DoctorProfilePayload } from "./types";
import { listSpecialties } from "../../../services/doctorApi";

type Props = { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void };

export default function DoctorSpecialtiesPicker({ value, onChange }: Props) {
  const [specs, setSpecs] = useState<{ id: number; name: string }[]>([]);
  const [customSpec, setCustomSpec] = useState("");

  useEffect(() => {
    let alive = true;
    listSpecialties()
      .then((list) => { if (alive) setSpecs(list); })
      .catch(() => { if (alive) setSpecs([]); });
    return () => { alive = false; };
  }, []);

  const toggle = (id: number) => {
    const sel = new Set(value.specialties ?? []); // ✅ نتعامل مع undefined
    sel.has(id) ? sel.delete(id) : sel.add(id);
    onChange({ ...value, specialties: Array.from(sel) });
  };

  const addCustom = () => {
    const s = customSpec.trim();
    if (!s) return;
    onChange({ ...value, custom_specialties: [ ...(value.custom_specialties ?? []), s ] });
    setCustomSpec("");
  };

  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid gap-2">
      <div className="text-sm font-semibold">التخصصات</div>

      <div className="flex flex-wrap gap-2">
        {specs.map((sp) => {
          const selected = (value.specialties ?? []).includes(sp.id); // ✅ بدون خطأ TS
          return (
            <button
              key={sp.id}
              type="button"
              onClick={() => toggle(sp.id)}
              className={`px-3 py-1 rounded-xl border border-white/10 ${selected ? "bg-blue-600" : "hover:bg-white/10"}`}
            >
              {sp.name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="إضافة تخصص آخر"
          value={customSpec}
          onChange={(e) => setCustomSpec(e.target.value)}
        />
        <Button variant="outline" onClick={addCustom}>إضافة</Button>
      </div>

      {(value.custom_specialties?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.custom_specialties!.map((n, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-xs">{n}</span>
          ))}
        </div>
      )}
    </section>
  );
}
