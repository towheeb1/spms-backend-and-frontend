// src/pages/doctors/DoctorDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { fetchDoctorDashboard, PatientRow, PieItem, RxRow, TrendItem, VisitRow, type DashboardPayload } from "../../services/doctorDashboard";
import { getDoctorProfile } from "../../services/doctorProfile";

import KPIStat from "../../components/doctor-componet/doctor-dashboard/KPIStat";
import Donut from "../../components/doctor-componet/doctor-dashboard/Donut";
import PatientsList from "../../components/doctor-componet/doctor-dashboard/PatientsList";
import Appointments from "../../components/doctor-componet/doctor-dashboard/Appointments";
import RecentPrescriptions from "../../components/doctor-componet/doctor-dashboard/RecentPrescriptions";
import MiniBars from "../../components/doctor-componet/doctor-dashboard/MiniBars";
import MiniCalendar from "../../components/doctor-componet/doctor-dashboard/MiniCalendar";
import Card from "../../components/doctor-componet/doctor-dashboard/Card";
import ProfileCard from "../../components/doctor-componet/doctor-dashboard/ProfileCard";

export default function DoctorDashboard() {
  const [dash, setDash] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [doctorName, setDoctorName] = useState("");
  const [doctorAvatar, setDoctorAvatar] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("");

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setErr(null);
    fetchDoctorDashboard()
      .then((d) => { if (alive) setDash(d); })
      .catch((e:any) => {
        const msg = e?.response?.data?.error || e?.message || "تعذر جلب البيانات";
        if (alive) setErr(msg);
      })
      .finally(() => alive && setLoading(false));

    // جلب اسم/صورة الطبيب من DB (ومن الممكن تستخلص التخصص من custom_specialties)
    getDoctorProfile()
      .then((p) => {
        if (!alive) return;
        setDoctorName(p.full_name || "");
        setDoctorAvatar(p.avatar_url || "");
        // إن أردت عرض تخصص واحد:
        // setDoctorSpecialty((p as any).custom_specialties?.[0] || "");
      })
      .catch(() => { /* تجاهل */ });

    return () => { alive = false; };
  }, []);

  const kpis = dash?.kpis ?? [
    { label: "إجمالي المرضى", value: 0 },
    { label: "مرضى اليوم", value: 0 },
    { label: "مواعيد اليوم", value: 0 },
    { label: "وصفات اليوم", value: 0 },
    { label: "انتهاء خلال 30يوم", value: 0 },
  ];
 const diseasePie: PieItem[]        = dash?.diseasePie ?? [];
const recentPatients: PatientRow[] = dash?.recentPatients ?? [];
const upcoming: VisitRow[]         = dash?.upcoming ?? [];
const recentRx: RxRow[]            = dash?.recentRx ?? [];
const last6: TrendItem[]           = dash?.last6 ?? [];

  return (
    <div dir="rtl" className="grid gap-4 text-white">
      {/* صف علوي: بروفايل + بحث */}
      <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
        <ProfileCard name={doctorName} specialty={doctorSpecialty} avatarUrl={doctorAvatar} />
        <Card>
          <div className="flex items-center gap-2">
            <input className="w-full px-3 py-2 rounded-xl bg-white/10" placeholder="ابحث عن مريض / وصفة / زيارة" />
            <button className="px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600">بحث</button>
          </div>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-5 gap-4">
        {kpis.map((k, i) => <KPIStat key={i} {...k} />)}
      </div>

      {/* منتصف */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Donut data={diseasePie} />
        <PatientsList rows={recentPatients} />
      </div>

      {/* أسفل */}
      <div className="grid xl:grid-cols-3 gap-4">
        <Appointments rows={upcoming} />
        <div className="grid gap-4">
          <RecentPrescriptions rows={recentRx} />
          <MiniBars data={last6} />
          <MiniCalendar />
        </div>
      </div>

      {loading && <div className="rounded-xl p-3 bg-white/5">جاري التحميل…</div>}
      {err && <div className="rounded-xl p-3 bg-red-600/80">{err}</div>}
    </div>
  );
}
