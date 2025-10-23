// src/components/doctor-login/DoctorBasicInfoForm.tsx
import { useState } from "react";
import { Input } from "../../ui/Input";
import { toWesternDigits } from "../../../utils/digits";
import { DoctorProfilePayload } from "./types";

const LICENSE_REGEX = /^(73|77|78|71|70)\d{7}$/; // 9 أرقام ويبدأ بـ 73/77/78/71/70

type Props = { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void };

export default function DoctorBasicInfoForm({ value, onChange }: Props) {
  const [licenseError, setLicenseError] = useState<string | null>(null);

  function onLicenseChange(raw: string) {
    const digits = toWesternDigits(raw).slice(0, 9);
    onChange({ ...value, doctor_number: digits });
    if (!digits) { setLicenseError(null); return; }
    setLicenseError(LICENSE_REGEX.test(digits) ? null : "رقم الترخيص يجب أن يبدأ بـ 73/77/78/71/70 وطوله 9 أرقام.");
  }

  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm opacity-80">اسم الطبيب *</label>
        <Input
          placeholder="الاسم الكامل"
          value={value.full_name}
          onChange={(e) => onChange({ ...value, full_name: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm opacity-80">رقم الطبيب / الترخيص *</label>
        <Input
          dir="ltr"
          inputMode="numeric"
          maxLength={9}
          placeholder="مثال: 731234567"
          value={value.doctor_number}
          onChange={(e) => onLicenseChange(e.target.value)}
          className="text-left"
        />
        {licenseError && <div className="text-xs mt-1" style={{ color: "#ef4444" }}>{licenseError}</div>}
      </div>

      <div>
        <label className="text-sm opacity-80">اسم العيادة *</label>
        <Input
          placeholder="مثال: عيادة د. أحمد"
          value={value.clinic_name}
          onChange={(e) => onChange({ ...value, clinic_name: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm opacity-80">عنوان العيادة *</label>
        <Input
          placeholder="المدينة - الشارع - أقرب معلم"
          value={value.clinic_address}
          onChange={(e) => onChange({ ...value, clinic_address: e.target.value })}
        />
      </div>
    </section>
  );
}
