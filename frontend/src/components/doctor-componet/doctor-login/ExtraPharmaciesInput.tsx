// =============================================================
// File: src/components/doctor-login/ExtraPharmaciesInput.tsx
// =============================================================
import { useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { DoctorProfilePayload } from "./types";

export default function ExtraPharmaciesInput({ value, onChange }: { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void }) {
  const [name, setName] = useState("");
  const add = () => {
    const n = name.trim(); if (!n) return;
    onChange({ ...value, extra_pharmacies: [ ...(value.extra_pharmacies || []), n ] });
    setName("");
  };
  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid md:grid-cols-[1fr_auto] gap-2">
      <Input placeholder="أضف اسم صيدلية يتعامل معها الطبيب" value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="outline" onClick={add}>إضافة</Button>
      {(value.extra_pharmacies?.length || 0) > 0 && (
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {value.extra_pharmacies!.map((n, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-xs">{n}</span>
          ))}
        </div>
      )}
    </section>
  );
}
