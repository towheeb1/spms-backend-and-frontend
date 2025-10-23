import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function DoctorNotifications() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.get("/doctor/notifications?doctor_id=1").then(r => setRows(r.data.list));
  }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">الإشعارات</h1>
      <ul className="grid gap-2">
        {rows.map(n => (
          <li key={n.notification_id} className="card rounded-2xl p-4">
            <div>{n.message}</div>
            <div className="text-xs opacity-70">
              {new Date(n.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {rows.length === 0 && <div className="opacity-70">لا توجد إشعارات.</div>}
      </ul>
    </div>
  );
}
