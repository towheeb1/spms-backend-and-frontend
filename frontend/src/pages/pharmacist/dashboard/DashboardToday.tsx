import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../components/ui";
import { formatCurrency } from "../../../utils/currency";
import { fetchPharmacistDashboard } from "../../../services/pharmacist";
import type { PharmacistDashboard } from "../../../services/pharmacist";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardToday = () => {
  const [data, setData] = useState<PharmacistDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboard = await fetchPharmacistDashboard({ period: "today" });
        if (isMounted) {
          setData(dashboard);
        }
      } catch (err) {
        console.error("DashboardToday load error:", err);
        if (isMounted) {
          setError("تعذر تحميل مؤشرات اليوم. تأكد من اتصال الخادم.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return [];
    const analytics = data.analytics;
    return [
      {
        title: "مبيعات اليوم",
        value: formatCurrency(data.kpis.salesToday || 0),
        hint: `${data.kpis.salesToday ? "فواتير" : ""}`,
      },
      {
        title: analytics?.purchasePrices?.title ?? "المشتريات",
        value: formatCurrency(analytics?.purchasePrices?.totalValue || 0),
        hint: analytics?.purchasePrices?.stats?.[0]?.label
          ? `${analytics.purchasePrices.stats[0].label}: ${analytics.purchasePrices.stats[0].value}`
          : undefined,
      },
      {
        title: analytics?.profit?.title ?? "صافي ربح تقريبي",
        value: formatCurrency(analytics?.profit?.totalValue || 0),
        hint: analytics?.profit?.period ? `الفترة: ${analytics.profit.period}` : undefined,
      },
      {
        title: analytics?.returns?.title ?? "المرتجعات",
        value: formatCurrency(analytics?.returns?.totalValue || 0),
        hint: analytics?.returns?.count ? `عدد المرتجعات: ${analytics.returns.count}` : undefined,
      },
    ];
  }, [data]);

  const paymentBreakdown = data?.analytics?.receipts?.chartData ?? [];
  const paymentCount = data?.analytics?.receipts?.stats?.find((s) => s.label.includes("عدد"))?.value;

  const chartCards = useMemo(() => {
    if (!data?.analytics) return [];
    const {
      receipts,
      payments,
      purchasePrices,
      profit,
      returns,
      purchaseOrder,
    } = data.analytics;

    const makeCard = (
      key: string,
      payload: typeof receipts | undefined,
      options: Partial<ChartCardConfig> = {}
    ) => {
      if (!payload) return null;
      return {
        key,
        payload,
        variant: options.variant ?? "bar",
        gradient: options.gradient ?? "from-slate-900 to-slate-800",
        accent: options.accent ?? "#f8fafc",
        pieColors: options.pieColors,
      } as ChartCardConfig;
    };

    return [
      makeCard("receipts", receipts, {
        gradient: "from-sky-500 via-sky-600 to-sky-700",
        accent: "#bae6fd",
      }),
      makeCard("payments", payments, {
        variant: "pie",
        gradient: "from-violet-500 via-indigo-600 to-indigo-700",
        pieColors: ["#f472b6", "#60a5fa", "#facc15", "#34d399", "#a78bfa"],
      }),
      makeCard("purchasePrices", purchasePrices, {
        gradient: "from-cyan-500 via-blue-500 to-blue-700",
        accent: "#99f6e4",
      }),
      makeCard("purchaseOrder", purchaseOrder, {
        gradient: "from-slate-800 via-slate-900 to-gray-900",
        accent: "#cbd5f5",
      }),
      makeCard("profit", profit, { gradient: "from-emerald-600 to-cyan-600" }),
      makeCard("returns", returns, {
        gradient: "from-rose-600 via-pink-600 to-amber-500",
        accent: "#fecdd3",
      }),
    ].filter(Boolean) as ChartCardConfig[];
  }, [data?.analytics]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">مؤشرات اليوم</h1>
          <p className="text-gray-400">عرض مباشر لمبيعات وأرباح اليوم استنادًا إلى قاعدة البيانات.</p>
        </div>
        {data?.period?.label && (
          <span className="text-sm text-gray-500">الفترة الحالية: {data.period.label}</span>
        )}
      </div>

      {error && (
        <Card className="border border-red-500/40 bg-red-500/10 text-red-100">
          <p>{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <Card key={card.title + index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5">
                <h2 className="text-lg font-semibold text-white mb-2">{card.title}</h2>
                <div className="text-2xl font-bold text-blue-300">{card.value}</div>
                {card.hint && <p className="text-xs text-gray-400 mt-2">{card.hint}</p>}
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-5">
              <h2 className="text-lg font-semibold mb-4">تفصيل طرق الدفع اليوم</h2>
              {paymentBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">لا توجد مدفوعات مسجلة اليوم.</p>
              ) : (
                <ul className="space-y-2">
                  {paymentBreakdown.map((item) => (
                    <li key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="font-medium text-white">{formatCurrency(item.value)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {paymentCount !== undefined && (
                <p className="mt-4 text-xs text-gray-400">عدد المدفوعات: {paymentCount}</p>
              )}
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-5">
              <h2 className="text-lg font-semibold mb-4">أحدث حركات المخزون</h2>
              {data?.recentMovements?.length ? (
                <ul className="space-y-3 text-sm">
                  {data.recentMovements.map((movement) => (
                    <li key={movement.id} className="border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex justify-between text-white/80">
                        <span>{movement.medicine_name}</span>
                        <span>{movement.qty_change > 0 ? "+" : ""}{movement.qty_change}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex justify-between">
                        <span>{new Date(movement.created_at).toLocaleString("ar-SA")}</span>
                        <span>{movement.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">لا توجد حركات مسجلة اليوم.</p>
              )}
            </Card>
          </div>

          {chartCards.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {chartCards.map((card) => (
                <AnalyticsChartCard key={card.key} config={card} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

type ChartCardConfig = {
  key: string;
  payload: NonNullable<PharmacistDashboard["analytics"]["purchasePrices"]>;
  variant: "bar" | "pie";
  gradient: string;
  accent: string;
  pieColors?: string[];
};

const PIE_COLORS = ["#94a3b8", "#38bdf8", "#a78bfa", "#34d399", "#fbbf24"];

const AnalyticsChartCard = ({ config }: { config: ChartCardConfig }) => {
  const { payload, variant, gradient, accent, pieColors } = config;
  const chartData = payload.chartData ?? [];
  const stats = payload.stats ?? [];

  const renderBarChart = () =>
    chartData.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.85)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="value" fill={accent} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <EmptyChartPlaceholder />
    );

  const renderPieChart = () =>
    chartData.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={3}
          >
            {chartData.map((_, idx) => (
              <Cell
                key={idx}
                fill={
                  (pieColors ?? PIE_COLORS)[idx % (pieColors ?? PIE_COLORS).length]
                }
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.85)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <EmptyChartPlaceholder />
    );

  return (
    <Card
      className={`relative overflow-hidden border border-white/10 text-white bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/70">{payload.title}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCurrency(payload.totalValue || 0)}
          </p>
        </div>
        {payload.period && (
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full">
            {payload.period}
          </span>
        )}
      </div>

      <div className="h-44 mt-4">
        {variant === "pie" ? renderPieChart() : renderBarChart()}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          {stats.slice(0, 2).map((stat) => (
            <div
              key={stat.label}
              className="bg-black/20 rounded-xl px-3 py-2 border border-white/10"
            >
              <span className="block text-xs text-white/70">{stat.label}</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const EmptyChartPlaceholder = () => (
  <div className="flex h-full items-center justify-center text-white/60 text-sm">
    لا تتوفر بيانات لعرضها
  </div>
);

export default DashboardToday;
