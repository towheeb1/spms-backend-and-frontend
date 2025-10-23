import { useState } from "react";
import DoctorAvatarUpload from "../../components/doctor-componet/doctor-login/DoctorAvatarUpload";
import DoctorBasicInfoForm from "../../components/doctor-componet/doctor-login/DoctorBasicInfoForm";
import WorkSchedulePicker from "../../components/doctor-componet/doctor-login/WorkSchedulePicker";
import ClinicLocationForm from "../../components/doctor-componet/doctor-login/ClinicLocationForm";
import NearbyPharmaciesSelector from "../../components/doctor-componet/doctor-login/NearbyPharmaciesSelector";
import ExtraPharmaciesInput from "../../components/doctor-componet/doctor-login/ExtraPharmaciesInput";
import LoginControls from "../../components/doctor-componet/doctor-login/LoginControls";
import { DoctorProfilePayload, DEFAULT_PROFILE } from "../../components/doctor-componet/doctor-login/types";
import { Link } from "react-router-dom";

function LoginDoctor() {
  const [form, setForm] = useState<DoctorProfilePayload>({ ...DEFAULT_PROFILE });
  const [avatarFile, setAvatarFile] = useState<File | undefined>();

  return (
    <div dir="rtl" className="container mx-auto max-w-5xl px-4 py-6 text-white">
      <h1 className="text-2xl font-bold mb-4">تسجيل الطبيب / الإعداد الأولي</h1>
      <div className="grid gap-6">
        <DoctorAvatarUpload file={avatarFile} onChange={setAvatarFile} />
        <DoctorBasicInfoForm value={form} onChange={setForm} />
        <WorkSchedulePicker value={form} onChange={setForm} />
        <ClinicLocationForm value={form} onChange={setForm} />
        <NearbyPharmaciesSelector value={form} onChange={setForm} />
        <ExtraPharmaciesInput value={form} onChange={setForm} />
        <div className="flex items-center justify-end">
          <LoginControls form={form} avatarFile={avatarFile} />
          <Link to={"/doctor"}>
          go
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginDoctor;
export { LoginDoctor }; // ← يوفّر Named Export
