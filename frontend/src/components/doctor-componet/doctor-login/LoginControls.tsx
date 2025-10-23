// src/components/doctor-login/LoginControls.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { saveDoctorProfile, uploadAvatar } from "../../../services/doctorAuth";
import { useAuth } from "../../../store/auth";
import { toWesternDigits } from "../../../utils/digits";
import axios from "axios";

type DoctorFormShape = {
  full_name: string;
  doctor_number: string;
  clinic_name: string;
  clinic_address: string;
  avatar_url?: string;
  work_schedule?: { days: string[]; start: string; end: string };
  specialties?: number[];
  custom_specialties?: string[];
  location?: { lat: number; lng: number };
  preferred_pharmacies?: number[];
  extra_pharmacies?: string[];
};

type Props = { form: DoctorFormShape; avatarFile?: File };

const LICENSE_REGEX = /^(73|77|78|71|70)\d{7}$/;

export default function LoginControls({ form, avatarFile }: Props) {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  function validateRequired(): string[] {
    const missing: string[] = [];
    if (!form.full_name) missing.push("الاسم");
    if (!form.doctor_number) missing.push("رقم الترخيص");
    if (!form.clinic_name) missing.push("اسم العيادة");
    if (!form.clinic_address) missing.push("عنوان العيادة");
    if (!form.work_schedule?.days?.length) missing.push("أيام الدوام");
    return missing;
  }

  async function login() {
    const errs = validateRequired();
    if (errs.length) { alert("الرجاء استكمال: " + errs.join("، ")); return; }

    const cleanLicense = toWesternDigits(form.doctor_number).slice(0, 9);
    if (!LICENSE_REGEX.test(cleanLicense)) {
      alert("رقم الترخيص يجب أن يبدأ بـ 73/77/78/71/70 وطوله 9 أرقام.");
      return;
    }

    setLoading(true);
    try {
        
      let avatar_url = form.avatar_url;
      if (avatarFile) {
        const up = await uploadAvatar(avatarFile);
        avatar_url = up.url;
      }
      localStorage.setItem("doctor_number", cleanLicense);
if (avatar_url) localStorage.setItem("doctor_avatar", avatar_url);

      await saveDoctorProfile({ ...form, doctor_number: cleanLicense, avatar_url });

      setUser({ id: String(Date.now()), name: form.full_name, role: "Doctor" });
      nav("/doctor");
    } catch (e: any) {
      // ✅ اعرض رسالة السيرفر بدل رسالة عامة
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as any)?.error || e.message || "تعذر تسجيل الدخول.";
        alert(msg);
      } else {
        alert("تعذر تسجيل الدخول. " + String(e));
      }
      console.error(e);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={login} loading={loading}>تسجيل الدخول</Button>
    </div>
  );
}
