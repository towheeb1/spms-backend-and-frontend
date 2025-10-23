// =============================================================
// File: src/components/doctor-login/ClinicLocationForm.tsx
// =============================================================
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { DoctorProfilePayload } from "./types";
import useGeolocation from "./useGeolocation";

export default function ClinicLocationForm({ value, onChange }: { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void }) {
  const { ask, allowed } = useGeolocation((pos) => onChange({ ...value, location: pos }));
  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2 text-sm font-semibold">العنوان والعيادة</div>
      <div>
        <label className="text-sm opacity-80">اسم العيادة *</label>
        <Input placeholder="مثال: عيادة د. أحمد" value={value.clinic_name} onChange={(e) => onChange({ ...value, clinic_name: e.target.value })} />
      </div>
      <div>
        <label className="text-sm opacity-80">عنوان العيادة *</label>
        <Input placeholder="المدينة - الشارع - أقرب معلم" value={value.clinic_address} onChange={(e) => onChange({ ...value, clinic_address: e.target.value })} />
      </div>
      <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
        <Button variant="outline" onClick={ask}>تحديد موقعي الحالي</Button>
        {allowed === false && <span className="text-xs opacity-70">لم يتم السماح بمشاركة الموقع</span>}
        {value.location && (
          <span className="text-xs opacity-70">الموقع: {value.location.lat.toFixed(5)}, {value.location.lng.toFixed(5)}</span>
        )}
      </div>
    </section>
  );
}
