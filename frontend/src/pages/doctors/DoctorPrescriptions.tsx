import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function DoctorPrescriptions() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.get("/prescriptions?doctor_id=1").then(r => setRows(r.data.list));
  }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">الوصفات</h1>
      <ul className="grid gap-2">
        {rows.map(r => (
          <li key={r.prescription_id} className="card rounded-2xl p-4">
            <div className="font-medium">وصفة #{r.prescription_id}</div>
            <div className="text-xs opacity-70">
              التاريخ: {new Date(r.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {rows.length === 0 && <div className="opacity-70">لا توجد وصفات.</div>}
      </ul>
    </div>
  );
}
