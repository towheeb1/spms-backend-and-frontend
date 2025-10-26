import { useEffect, useState } from "react";
import { fetchPharmacistDashboard } from "../../../services/pharmacist";
import type { PharmacistDashboard } from "../../../services/pharmacist";
import { KPIGrid } from "../../../components/pharmacist/pharmacist-dashboard/KPIGrid";
import { RecentMovements } from "../../../components/pharmacist/pharmacist-dashboard/RecentMovements";
import { DataTable, Select } from "../../../components/ui";
import DashboardCharts from "../../../components/pharmacist/pharmacist-dashboard/DashboardCharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<{ medicines: number; lowStock: number; suppliers: number; salesToday: number }>({ medicines: 0, lowStock: 0, suppliers: 0, salesToday: 0 });
  const [recent, setRecent] = useState<Array<{ id: number; created_at: string; reason: string; qty_change: number; medicine_name: string }>>([]);
  const [topMeds, setTopMeds] = useState<Array<{ id: number; name: string; stock_qty: number; price: number }>>([]);
  const [dashboardData, setDashboardData] = useState<PharmacistDashboard | null>(null);
  const [period, setPeriod] = useState("7d");
  const periodOptions = [
    { value: "today", label: "اليوم" },
    { value: "7d", label: "آخر 7 أيام" },
    { value: "30d", label: "آخر 30 يوم" },
    { value: "90d", label: "آخر 90 يوم" },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPharmacistDashboard({ period });
        setKpis(data.kpis);
        setRecent(data.recentMovements);
        setTopMeds(data.topMedicines);
        setDashboardData(data);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  const kpiData = kpis;

  const topColumns = [
    { key: "name", title: "اسم الصنف" },
    { key: "stock_qty", title: "المخزون" },
    { key: "price", title: "السعر" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* العنوان والتحكم */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-400 mt-1">نظرة شاملة على أداء النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onChange={(value) => setPeriod(String(value))}
            options={periodOptions}
            className="min-w-[180px]"
          />
          <button className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 flex items-center gap-2 transition-colors">
            <span>🔄</span>
            تحديث
          </button>
        </div>
      </div>

      {/* الإحصائيات */}
      <KPIGrid kpis={kpiData} />

      {/* تحليلات المبيعات والمشتريات */}
      {dashboardData?.analytics && (
        <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold">تحليلات الأداء</h2>
              <p className="text-sm text-white/60">الفترة الحالية: {dashboardData?.period?.label || "—"}</p>
            </div>
          </div>
          <DashboardCharts analytics={dashboardData.analytics} />
        </div>
      )}

      {/* التحركات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
          <h2 className="text-xl font-semibold mb-6">أعلى الأصناف</h2>
                  <div className="mt-4 h-96 overflow-y-auto pr-2">
                              <DataTable columns={topColumns} rows={topMeds} />

</div>
        </div>
        <div className="mt-4 h-96 overflow-y-auto pr-2">
          <RecentMovements items={recent} />


        </div>
      </div>

      {/* أزرار الوصول السريع */}

    </div>
  );
}
