import DoctorConditions from "./DoctorConditions";
import DoctorLayout from "./DoctorLayout";
import DoctorPrescription from "./DoctorPrescription";

export default function DoctorHome() {
  return (
    <div className="grid gap-4">
    <DoctorLayout />
      <div className="card rounded-2xl p-4">
        <div className="font-semibold mb-2">لوحة الطبيب</div>
        <ul className="list-disc pr-6 opacity-80">
          <li>إنشاء وصفة إلكترونية</li>
          <li>سجل المرضى والوصفات السابقة</li>
          <li>إرسال وصفة للصيدلية عبر QR</li>
        </ul>
      </div>
    </div>
  )
}
