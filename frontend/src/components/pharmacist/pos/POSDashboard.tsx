// src/components/pharmacist/pos/POSDashboard.tsx
import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiShoppingCart, FiPackage, FiBarChart, FiCalendar } from "react-icons/fi";
import { formatCurrency } from "../../../utils/currency";
import { getSalesHistory, calculateDailyProfit, calculatePeriodProfit } from "../../../services/sales";
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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // حساب إحصائيات اليوم
      const todayData = calculateDailyProfit();
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const weekData = calculatePeriodProfit(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
      const monthData = calculatePeriodProfit(
        monthStart.toISOString().split('T')[0],
        monthEnd.toISOString().split('T')[0]
      );

      // حساب عدد العناصر في المخزون
      const inventory = JSON.parse(localStorage.getItem('pharmacy_inventory') || '{}');
      const totalItems = Object.keys(inventory).length;
      const lowStockItems = Object.values(inventory).filter((item: any) =>
        item.current_stock <= item.min_stock
      ).length;

      setStats({
        todaySales: todayData.totalSales,
        todayProfit: todayData.totalProfit,
        todayTransactions: todayData.transactionCount,
        weekSales: weekData.totalSales,
        weekProfit: weekData.totalProfit,
        monthSales: monthData.totalSales,
        monthProfit: monthData.totalProfit,
        lowStockItems,
        totalItems,
        profitMargin: todayData.profitMargin
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfitStatus = (profit: number, cost: number) => {
    if (cost === 0) return { status: 'neutral', color: '#94a3b8', text: 'لا توجد مبيعات' };
    const margin = (profit / cost) * 100;
    if (margin >= 20) return { status: 'excellent', color: '#86efac', text: 'ممتاز' };
    if (margin >= 10) return { status: 'good', color: '#4ade80', text: 'جيد' };
    if (margin >= 0) return { status: 'fair', color: '#fbbf24', text: 'مقبول' };
    return { status: 'loss', color: '#fca5a5', text: 'خسارة' };
  };

  const todayStatus = getProfitStatus(stats.todayProfit, stats.todaySales * 0.7);
  const weekStatus = getProfitStatus(stats.weekProfit, stats.weekSales * 0.7);
  const monthStatus = getProfitStatus(stats.monthProfit, stats.monthSales * 0.7);

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
              {todayStatus.text} ({stats.profitMargin.toFixed(1)}%)
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
                {stats.profitMargin.toFixed(1)}%
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
            <span>هامش الربح منخفض ({stats.profitMargin.toFixed(1)}%). راجع أسعار البيع أو التكاليف.</span>
          </div>
        )}

        {stats.profitMargin >= 15 && (
          <div className="alert-item success">
            <span>أداء ممتاز! هامش الربح ({stats.profitMargin.toFixed(1)}%) فوق المعدل الطبيعي.</span>
          </div>
        )}
      </div>
    </div>
  );
}
