// src/components/pharmacist/pos/POSDashboard.tsx
import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiShoppingCart, FiPackage, FiBarChart, FiCalendar } from "react-icons/fi";
import { formatCurrency } from "../../../utils/currency";
import { fetchPharmacistDashboard } from "../../../services/pharmacist";
import type { DashboardStat } from "../../../services/pharmacist";
import "./style/POSDashboard.css";

interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  todayTransactions: number;
  weekSales: number;
  weekProfit: number;
  monthSales: number;
  monthProfit: number;
  lowStockItems: number;
  totalItems: number;
  profitMargin: number;
}

export default function POSDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayProfit: 0,
    todayTransactions: 0,
    weekSales: 0,
    weekProfit: 0,
    monthSales: 0,
    monthProfit: 0,
    lowStockItems: 0,
    totalItems: 0,
    profitMargin: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let isMounted = true;

      const [todayData, weekData, monthData] = await Promise.all([
        fetchPharmacistDashboard({ period: "today" }),
        fetchPharmacistDashboard({ period: "7d" }),
        fetchPharmacistDashboard({ period: "30d" }),
      ]);

      if (!isMounted) return;

      const extractStatValue = (statsArr: DashboardStat[] | undefined, keywords: string[]): number => {
        if (!statsArr) return 0;
        for (const keyword of keywords) {
          const found = statsArr.find((stat) => typeof stat.label === "string" && stat.label.includes(keyword));
          if (found) return Number(found.value || 0);
        }
        return 0;
      };

      const todaySales = Number(todayData?.kpis?.salesToday || 0);
      const todayProfit = Number(todayData?.analytics?.profit?.totalValue || 0);
      const todayTransactions = extractStatValue(todayData?.analytics?.payments?.stats, ["الفواتير", "Transactions", "فاتورة"])
        || extractStatValue(todayData?.analytics?.receipts?.stats, ["المدفوعات", "Payments"]);

      const weekSales = Number(weekData?.analytics?.payments?.totalValue || 0);
      const weekProfit = Number(weekData?.analytics?.profit?.totalValue || 0);

      const monthSales = Number(monthData?.analytics?.payments?.totalValue || 0);
      const monthProfit = Number(monthData?.analytics?.profit?.totalValue || 0);

      const lowStockItems = Number(todayData?.kpis?.lowStock || 0);
      const totalItems = Number(todayData?.kpis?.medicines || 0);

      const todayProfitMargin = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;

      setStats({
        todaySales,
        todayProfit,
        todayTransactions,
        weekSales,
        weekProfit,
        monthSales,
        monthProfit,
        lowStockItems,
        totalItems,
        profitMargin: todayProfitMargin,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError("تعذر تحميل بيانات لوحة POS. تأكد من اتصال الخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  const getProfitStatus = (sales: number, profit: number) => {
    if (sales === 0) return { status: 'neutral', color: '#94a3b8', text: 'لا توجد بيانات', margin: 0 };
    const margin = (profit / sales) * 100;
    if (margin >= 20) return { status: 'excellent', color: '#86efac', text: 'ممتاز', margin };
    if (margin >= 10) return { status: 'good', color: '#4ade80', text: 'جيد', margin };
    if (margin >= 0) return { status: 'fair', color: '#fbbf24', text: 'مقبول', margin };
    return { status: 'loss', color: '#fca5a5', text: 'خسارة', margin };
  };

  const todayStatus = getProfitStatus(stats.todaySales, stats.todayProfit);
  const weekStatus = getProfitStatus(stats.weekSales, stats.weekProfit);
  const monthStatus = getProfitStatus(stats.monthSales, stats.monthProfit);

  if (isLoading) {
    return (
      <div className="pos-dashboard loading">
        <div className="loading-spinner"></div>
        <span>جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  return (
    <div className="pos-dashboard">
 
      <div className="dashboard-header">
        <h3 className="dashboard-title">لوحة تحكم نقطة البيع</h3>
        <p className="dashboard-subtitle">نظرة عامة على الأداء والمبيعات</p>
      </div>

      {error && (
        <div className="alert-item danger" style={{ marginBottom: "1rem" }}>
          <span>{error}</span>
        </div>
      )}

      {/* كروت الإحصائيات الرئيسية */}
      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <span className="stat-label">مبيعات اليوم</span>
            <span className="stat-value">{formatCurrency(stats.todaySales)}</span>
            <span className="stat-change">
              <FiTrendingUp className="change-icon" />
              {stats.todayTransactions} عملية
            </span>
          </div>
        </div>

        <div className={`stat-card profit ${todayStatus.status}`}>
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">أرباح اليوم</span>
            <span className="stat-value">{formatCurrency(stats.todayProfit)}</span>
            <span className="stat-status">
              <span
                className="status-indicator"
                style={{ backgroundColor: todayStatus.color }}
              ></span>
              {todayStatus.text} ({todayStatus.margin.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="stat-card inventory">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <span className="stat-label">حالة المخزون</span>
            <span className="stat-value">{stats.totalItems} عنصر</span>
            <span className={`stat-alert ${stats.lowStockItems > 0 ? 'warning' : 'good'}`}>
              {stats.lowStockItems > 0 ? `${stats.lowStockItems} بحاجة للتجديد` : 'مخزون متوازن'}
            </span>
          </div>
        </div>

        <div className="stat-card performance">
          <div className="stat-icon">
            <FiBarChart />
          </div>
          <div className="stat-content">
            <span className="stat-label">أداء الشهر</span>
            <span className="stat-value">{formatCurrency(stats.monthProfit)}</span>
            <span className="stat-period">
              <FiCalendar className="period-icon" />
              {new Date().toLocaleDateString('ar-SA', { month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* إحصائيات تفصيلية */}
      <div className="dashboard-detailed-stats">
        <div className="stats-comparison">
          <h4 className="comparison-title">مقارنة الفترات</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <span className="comparison-label">هذا الأسبوع</span>
              <span className="comparison-value">{formatCurrency(stats.weekSales)}</span>
              <span className="comparison-profit" style={{ color: weekStatus.color }}>
                ربح: {formatCurrency(stats.weekProfit)}
              </span>
            </div>

            <div className="comparison-item">
              <span className="comparison-label">هذا الشهر</span>
              <span className="comparison-value">{formatCurrency(stats.monthSales)}</span>
              <span className="comparison-profit" style={{ color: monthStatus.color }}>
                ربح: {formatCurrency(stats.monthProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* مؤشرات الأداء */}
        <div className="performance-indicators">
          <h4 className="indicators-title">مؤشرات الأداء</h4>
          <div className="indicators-list">
            <div className="indicator-item">
              <span className="indicator-label">متوسط العملية:</span>
              <span className="indicator-value">
                {formatCurrency(stats.todayTransactions > 0 ? stats.todaySales / stats.todayTransactions : 0)}
              </span>
            </div>

            <div className="indicator-item">
              <span className="indicator-label">هامش الربح:</span>
              <span className="indicator-value" style={{ color: todayStatus.color }}>
                {todayStatus.margin.toFixed(1)}%
              </span>
            </div>

            <div className="indicator-item">
              <span className="indicator-label">عناصر منخفضة المخزون:</span>
              <span className="indicator-value" style={{ color: stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e' }}>
                {stats.lowStockItems} عنصر
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* تنبيهات وتوصيات */}
      <div className="dashboard-alerts">
        {stats.todaySales === 0 && (
          <div className="alert-item info">
            <span>لا توجد مبيعات اليوم حتى الآن. حاول تحسين العرض أو التسويق.</span>
          </div>
        )}

        {stats.lowStockItems > 0 && (
          <div className="alert-item warning">
            <span>{stats.lowStockItems} عنصر في المخزون منخفض ويحتاج للتجديد.</span>
          </div>
        )}

        {stats.profitMargin < 5 && stats.todaySales > 0 && (
          <div className="alert-item danger">
            <span>هامش الربح منخفض ({todayStatus.margin.toFixed(1)}%). راجع أسعار البيع أو التكاليف.</span>
          </div>
        )}

        {todayStatus.margin >= 15 && (
          <div className="alert-item success">
            <span>أداء ممتاز! هامش الربح ({todayStatus.margin.toFixed(1)}%) فوق المعدل الطبيعي.</span>
          </div>
        )}
      </div>
 
</div>
   );
}
