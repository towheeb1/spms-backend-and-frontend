import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import DashboardCharts from "./pharmacist-dashboard/DashboardCharts";
import PaymentsCard from "./pharmacist-dashboard/PaymentsCard";
import ProfitCard from "./pharmacist-dashboard/ProfitCard";
import PurchaseOrderCard from "./pharmacist-dashboard/PurchaseOrderCard";
import PurchasePricesCard from "./pharmacist-dashboard/PurchasePricesCard";
import ReceiptsCard from "./pharmacist-dashboard/ReceiptsCard";
import ReturnsCard from "./pharmacist-dashboard/ReturnsCard";
import { fetchPharmacistDashboard, PharmacistDashboard } from "../../services/pharmacist";

export default function DashboardPage() {
  const [data, setData] = useState<PharmacistDashboard | null>(null);
  const [branchId, setBranchId] = useState(1);

  useEffect(() => {
    loadDashboard();
  }, [branchId]);

  const loadDashboard = async () => {
    try {
      const data = await fetchPharmacistDashboard({ branchId, period: "7d" });
      setData(data);
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-400">{data?.kpis.salesToday.toFixed(2) || 0}</div>
          <div className="text-sm text-white/60">مبيعات اليوم</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-400">{data?.kpis.salesToday ? 1 : 0}</div> {/* Assuming invoice_count from sales */}
          <div className="text-sm text-white/60">عدد الفواتير</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{data?.kpis.salesToday.toFixed(2) || 0}</div> {/* Assuming avg from sales */}
          <div className="text-sm text-white/60">متوسط الفاتورة</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-400">{data?.kpis.salesToday.toFixed(2) || 0}</div> {/* Assuming cash drawer from sales */}
          <div className="text-sm text-white/60">رصيد درج النقد</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.analytics.payments && <PaymentsCard {...data.analytics.payments} />}
        {data?.analytics.profit && <ProfitCard {...data.analytics.profit} />}
        {data?.analytics.purchaseOrder && <PurchaseOrderCard {...data.analytics.purchaseOrder} />}
        {data?.analytics.purchasePrices && <PurchasePricesCard {...data.analytics.purchasePrices} />}
        {data?.analytics.receipts && <ReceiptsCard {...data.analytics.receipts} />}
        {data?.analytics.returns && <ReturnsCard {...data.analytics.returns} />}
      </div>

      {data && (
        <Card className="mt-6">
          <h3 className="text-xl font-semibold mb-6">تحليلات الأداء</h3>
          <DashboardCharts analytics={data.analytics} />
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold mb-4">آخر 20 حركة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2">الدواء</th>
                <th className="text-left p-2">التاريخ</th>
                <th className="text-left p-2">الكمية</th>
                <th className="text-left p-2">السبب</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-white/5">
                  <td className="p-2">{movement.medicine_name}</td>
                  <td className="p-2">{new Date(movement.created_at).toLocaleDateString("ar-SA")}</td>
                  <td className="p-2">{movement.qty_change}</td>
                  <td className="p-2">{movement.reason}</td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
