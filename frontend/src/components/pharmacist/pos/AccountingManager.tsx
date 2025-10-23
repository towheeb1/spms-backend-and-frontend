// src/components/pharmacist/pos/AccountingManager.tsx
import React, { useState, useEffect } from "react";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiBarChart, FiPieChart } from "react-icons/fi";
import { formatCurrency } from "../../../utils/currency";
import { getSalesHistory, calculateDailyProfit, calculatePeriodProfit } from "../../../services/sales";
import "./style/AccountingManager.css";

interface AccountingManagerProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function AccountingManager({ onDateRangeChange }: AccountingManagerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [profitData, setProfitData] = useState<{
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    transactionCount: number;
  }>({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    transactionCount: 0
  });

  useEffect(() => {
    calculateProfitForPeriod();
  }, [selectedPeriod, startDate, endDate]);

  const calculateProfitForPeriod = () => {
    let start: string;
    let end: string;

    switch (selectedPeriod) {
      case 'today':
        start = end = new Date().toISOString().split('T')[0];
        break;
      case 'week':
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        start = weekStart.toISOString().split('T')[0];
        end = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        start = monthStart.toISOString().split('T')[0];
        end = monthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        start = startDate;
        end = endDate;
        break;
      default:
        start = end = new Date().toISOString().split('T')[0];
    }

    if (selectedPeriod === 'custom' && (!start || !end)) {
      return;
    }

    const data = selectedPeriod === 'custom' && start && end
      ? calculatePeriodProfit(start, end)
      : calculateDailyProfit();

    setProfitData(data);
    onDateRangeChange?.(start, end);
  };

  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'custom') => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      calculateProfitForPeriod();
    }
  };

  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      calculateProfitForPeriod();
    }
  };

  const getProfitStatusColor = () => {
    if (profitData.profitMargin >= 20) return 'excellent';
    if (profitData.profitMargin >= 10) return 'good';
    if (profitData.profitMargin >= 0) return 'fair';
    return 'loss';
  };

  const getProfitStatusText = () => {
    if (profitData.profitMargin >= 20) return 'أرباح ممتازة';
    if (profitData.profitMargin >= 10) return 'أرباح جيدة';
    if (profitData.profitMargin >= 0) return 'أرباح مقبولة';
    return 'خسائر';
  };

  return (
    <div className="accounting-manager">
      <div className="accounting-header">
        <div className="header-info">
          <h3 className="accounting-title">إدارة المحاسبة والأرباح</h3>
          <p className="accounting-subtitle">تحليل الأداء المالي والربحية</p>
        </div>

        <div className="period-selector">
          <div className="period-buttons">
            {[
              { key: 'today', label: 'اليوم', icon: FiCalendar },
              { key: 'week', label: 'هذا الأسبوع', icon: FiBarChart },
              { key: 'month', label: 'هذا الشهر', icon: FiPieChart },
              { key: 'custom', label: 'مخصص', icon: FiCalendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handlePeriodChange(key as any)}
                className={`period-button ${selectedPeriod === key ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {selectedPeriod === 'custom' && (
            <div className="custom-date-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
              <span className="date-separator">إلى</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
              <button
                onClick={handleCustomDateSubmit}
                className="date-submit-button"
                disabled={!startDate || !endDate}
              >
                حساب
              </button>
            </div>
          )}
        </div>
      </div>

      {/* كروت المجاميع */}
      <div className="accounting-summary-cards">
        <div className="summary-card sales">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <span className="card-label">إجمالي المبيعات</span>
            <span className="card-value">{formatCurrency(profitData.totalSales)}</span>
            <span className="card-transactions">{profitData.transactionCount} عملية</span>
          </div>
        </div>

        <div className="summary-card cost">
          <div className="card-icon">
            <FiTrendingDown />
          </div>
          <div className="card-content">
            <span className="card-label">إجمالي التكاليف</span>
            <span className="card-value">{formatCurrency(profitData.totalCost)}</span>
            <span className="card-percentage">
              {profitData.totalSales > 0 ? ((profitData.totalCost / profitData.totalSales) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        <div className={`summary-card profit ${getProfitStatusColor()}`}>
          <div className="card-icon">
            {profitData.profitMargin >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          </div>
          <div className="card-content">
            <span className="card-label">صافي الأرباح</span>
            <span className="card-value">{formatCurrency(profitData.totalProfit)}</span>
            <span className="card-status">
              <div className="profit-status">
                <span className="status-text">{getProfitStatusText()}</span>
                <span className="status-percentage">
                  {Math.abs(profitData.profitMargin).toFixed(1)}%
                </span>
              </div>
            </span>
          </div>
        </div>

        <div className="summary-card margin">
          <div className="card-icon">
            <FiBarChart />
          </div>
          <div className="card-content">
            <span className="card-label">هامش الربح</span>
            <span className="card-value">
              {profitData.profitMargin.toFixed(1)}%
            </span>
            <span className="card-trend">
              {profitData.profitMargin >= 0 ? '↗️' : '↘️'}
              {Math.abs(profitData.profitMargin).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* مخطط الأرباح (نصي للآن) */}
      <div className="profit-chart-section">
        <h4 className="chart-title">تحليل الأرباح والخسائر</h4>
        <div className="profit-analysis">
          <div className="analysis-item">
            <span className="analysis-label">نسبة التكلفة للمبيعات:</span>
            <span className="analysis-value">
              {profitData.totalSales > 0 ? ((profitData.totalCost / profitData.totalSales) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="analysis-item">
            <span className="analysis-label">نسبة الربح الإجمالي:</span>
            <span className="analysis-value">
              {profitData.totalCost > 0 ? ((profitData.totalProfit / profitData.totalCost) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="analysis-item">
            <span className="analysis-label">متوسط ربح العملية:</span>
            <span className="analysis-value">
              {formatCurrency(profitData.transactionCount > 0 ? profitData.totalProfit / profitData.transactionCount : 0)}
            </span>
          </div>

          <div className="analysis-item">
            <span className="analysis-label">معدل دوران المخزون:</span>
            <span className="analysis-value">
              {profitData.totalCost > 0 ? ((profitData.totalSales / profitData.totalCost) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* توصيات */}
      <div className="accounting-recommendations">
        <h4 className="recommendations-title">توصيات لتحسين الأرباح</h4>
        <div className="recommendations-list">
          {profitData.profitMargin < 10 && (
            <div className="recommendation-item warning">
              <span className="recommendation-text">
                هامش الربح منخفض ({profitData.profitMargin.toFixed(1)}%)، يُنصح بمراجعة أسعار البيع أو التكاليف
              </span>
            </div>
          )}

          {profitData.transactionCount < 5 && selectedPeriod === 'today' && (
            <div className="recommendation-item info">
              <span className="recommendation-text">
                عدد العمليات منخفض اليوم ({profitData.transactionCount})، حاول زيادة التسويق
              </span>
            </div>
          )}

          {profitData.profitMargin >= 20 && (
            <div className="recommendation-item success">
              <span className="recommendation-text">
                أداء ممتاز! هامش الربح ({profitData.profitMargin.toFixed(1)}%) فوق المعدل الطبيعي
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
