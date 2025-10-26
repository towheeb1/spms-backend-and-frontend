// frontend/src/pages/pharmacist/Reports/Reports.tsx
import React, { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/Toast";
import { api } from "../../../services/api";
import { getProfitReport, getSalesReport, ProfitReport, SalesReport } from "../../../services/sales";
import "./Reports.css";

export default function Reports() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"sales" | "profit">("sales");
  const [loading, setLoading] = useState(false);
  const [quickRange, setQuickRange] = useState<"today" | "7d" | "30d" | "365d" | null>("7d");

  // فلاتر التاريخ
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [branchId, setBranchId] = useState<number | "">("");

  // بيانات التقارير
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);

  // تحميل الأفرع
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (activeTab === "sales" && !salesReport) {
      loadSalesReport();
    } else if (activeTab === "profit" && !profitReport) {
      loadProfitReport();
    }
  }, [activeTab, salesReport, profitReport]);

  const loadBranches = async () => {
    try {
      const { data } = await api.get("/pharmacist/profile");
      const rawBranches = data?.profile?.branches;

      let resolved: Array<{ id: number; name: string }> = [];

      if (Array.isArray(rawBranches)) {
        resolved = rawBranches
          .map((branch: any, index: number) => ({
            id: Number(branch?.id ?? index + 1),
            name: branch?.name || branch?.display_name || `فرع ${index + 1}`,
          }))
          .filter((branch) => Boolean(branch.name));
      } else if (typeof rawBranches === "string") {
        try {
          const parsed = JSON.parse(rawBranches);
          if (Array.isArray(parsed)) {
            resolved = parsed
              .map((branch: any, index: number) => ({
                id: Number(branch?.id ?? index + 1),
                name: branch?.name || branch?.display_name || `فرع ${index + 1}`,
              }))
              .filter((branch) => Boolean(branch.name));
          }
        } catch (err) {
          console.warn("Failed to parse branches JSON", err);
        }
      }

      if (!resolved.length && data?.profile?.display_name) {
        resolved = [
          {
            id: Number(data.profile?.pharmacy_id ?? 1),
            name: data.profile.display_name,
          },
        ];
      }

      setBranches(resolved);
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("تعذر تحميل بيانات الأفرع");
    }
  };

  const formatDateInput = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const applyQuickFilter = (range: "today" | "7d" | "30d" | "365d") => {
    setQuickRange(range);
    const end = new Date();
    let start = new Date();

    switch (range) {
      case "today":
        break;
      case "7d":
        start.setDate(end.getDate() - 6);
        break;
      case "30d":
        start.setDate(end.getDate() - 29);
        break;
      case "365d":
        start.setDate(end.getDate() - 364);
        break;
    }

    setDateFrom(formatDateInput(start));
    setDateTo(formatDateInput(end));

    if (activeTab === "sales") {
      loadSalesReportWithParams({ from: formatDateInput(start), to: formatDateInput(end), branch_id: branchId || undefined });
    } else {
      loadProfitReportWithParams({ from: formatDateInput(start), to: formatDateInput(end), branch_id: branchId || undefined });
    }
  };

  const loadSalesReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      if (branchId) params.branch_id = branchId;

      const data = await getSalesReport(params);
      setSalesReport(data);
    } catch (error: any) {
      console.error("Error loading sales report:", error);
      toast.error("فشل في تحميل تقرير المبيعات");
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReportWithParams = async (params: { from?: string; to?: string; branch_id?: number }) => {
    setLoading(true);
    try {
      const data = await getSalesReport(params);
      setSalesReport(data);
    } catch (error: any) {
      console.error("Error loading sales report:", error);
      toast.error("فشل في تحميل تقرير المبيعات");
    } finally {
      setLoading(false);
    }
  };

  const loadProfitReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      if (branchId) params.branch_id = branchId;

      const data = await getProfitReport(params);
      setProfitReport(data);
    } catch (error: any) {
      console.error("Error loading profit report:", error);
      toast.error("فشل في تحميل تقرير الأرباح");
    } finally {
      setLoading(false);
    }
  };

  const loadProfitReportWithParams = async (params: { from?: string; to?: string; branch_id?: number }) => {
    setLoading(true);
    try {
      const data = await getProfitReport(params);
      setProfitReport(data);
    } catch (error: any) {
      console.error("Error loading profit report:", error);
      toast.error("فشل في تحميل تقرير الأرباح");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (activeTab === "sales") {
      loadSalesReport();
    } else {
      loadProfitReport();
    }
  };

  const handleExport = async () => {
    try {
      const buildTable = (headers: string[], rows: (string | number)[][]) => {
        const headerHtml = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
        const rowsHtml = rows
          .map((row) => `<tr>${row.map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`)
          .join("");
        return `<table border="1" style="border-collapse:collapse; text-align:right;">${headerHtml}${rowsHtml}</table>`;
      };

      const downloadExcel = (filename: string, tables: string[]) => {
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /></head><body style="direction:rtl;">${tables.join("<br/>")}</body></html>`;
        const blob = new Blob([html], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}-${Date.now()}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      if (activeTab === "sales") {
        if (!salesReport) {
          await loadSalesReport();
        }
        const report = salesReport ?? (await getSalesReport({
          from: dateFrom || undefined,
          to: dateTo || undefined,
          branch_id: branchId || undefined,
        }));
        const rows = report.sales;
        if (!rows.length) {
          toast.info("لا توجد بيانات لتصديرها");
          return;
        }
        const header = ["رقم الفاتورة", "تاريخ البيع", "العميل", "الفرع", "عدد العناصر", "المبلغ الإجمالي"];
        const tableRows = rows.map((sale) => [
          sale.id,
          new Date(sale.sale_date).toLocaleString("ar-SA"),
          sale.customer_name || "عميل نقدي",
          sale.branch_name || "-",
          sale.items_count,
          formatCurrency(sale.total),
        ]);
        const table = buildTable(header, tableRows);
        downloadExcel("sales-report", [table]);
      } else {
        if (!profitReport) {
          await loadProfitReport();
        }
        const report = profitReport ?? (await getProfitReport({
          from: dateFrom || undefined,
          to: dateTo || undefined,
          branch_id: branchId || undefined,
        }));
        const header = ["الفرع", "عدد المبيعات", "الإيرادات", "التكلفة", "الربح", "هامش الربح %"];
        const sumTable = buildTable(
          ["البند", "القيمة"],
          [
            ["إجمالي المبيعات", report.summary.total_sales],
            ["إجمالي الإيرادات", formatCurrency(report.summary.total_revenue)],
            ["إجمالي التكلفة", formatCurrency(report.summary.total_cost)],
            ["صافي الربح", formatCurrency(report.summary.total_profit)],
            ["هامش الربح", `${report.summary.profit_margin}%`],
          ]
        );

        const branchRows = report.branches.map((branch) => [
          branch.branch_name,
          branch.sales_count,
          formatCurrency(branch.revenue),
          formatCurrency(branch.cost),
          formatCurrency(branch.profit),
          branch.profit_margin,
        ]);
        const branchesTable = buildTable(header, branchRows);
        downloadExcel("profit-report", [sumTable, branchesTable]);
      }
      toast.success("تم تصدير التقرير بنجاح");
    } catch (error) {
      console.error("export error", error);
      toast.error("تعذر تصدير التقرير");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-YE");
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="reports-title">التقارير والإحصائيات</h1>
        <div className="reports-tabs">
          <button
            className={`reports-tab ${activeTab === "sales" ? "active" : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            تقرير المبيعات
          </button>
          <button
            className={`reports-tab ${activeTab === "profit" ? "active" : ""}`}
            onClick={() => setActiveTab("profit")}
          >
            تقرير الأرباح
          </button>
        </div>
      </div>

      {/* فلاتر التاريخ والفرع */}
      <div className="reports-filters">
        <div className="quick-filters">
          {[{ key: "today", label: "اليوم" }, { key: "7d", label: "الأسبوع" }, { key: "30d", label: "الشهر" }, { key: "365d", label: "السنة" }].map((filter) => (
            <button
              key={filter.key}
              className={`quick-filter-button ${quickRange === filter.key ? "active" : ""}`}
              onClick={() => applyQuickFilter(filter.key as any)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <label>من تاريخ:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>إلى تاريخ:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>الفرع:</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : "")}
            className="filter-select"
          >
            <option value="">جميع الأفرع</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleFilter} className="filter-button" disabled={loading}>
          {loading ? "جاري التحميل..." : "عرض التقرير"}
        </button>
        <button onClick={handleExport} className="export-button" disabled={loading}>
          تصدير التقرير
        </button>
      </div>

      {/* محتوى التقرير */}
      <div className="reports-content">
        {activeTab === "sales" && salesReport && (
          <div className="sales-report">
            <h2>تقرير المبيعات</h2>
            <div className="report-summary">
              <div className="summary-card">
                <h3>إجمالي المبيعات</h3>
                <div className="summary-value">{salesReport.sales.length}</div>
              </div>
              <div className="summary-card">
                <h3>إجمالي الإيرادات</h3>
                <div className="summary-value">
                  {formatCurrency(salesReport.sales.reduce((sum, sale) => sum + sale.total, 0))}
                </div>
              </div>
              <div className="summary-card">
                <h3>متوسط المبيعة</h3>
                <div className="summary-value">
                  {formatCurrency(
                    salesReport.sales.length > 0
                      ? salesReport.sales.reduce((sum, sale) => sum + sale.total, 0) / salesReport.sales.length
                      : 0
                  )}
                </div>
              </div>
            </div>

            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>تاريخ البيع</th>
                    <th>العميل</th>
                    <th>الفرع</th>
                    <th>عدد العناصر</th>
                    <th>المبلغ الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>{formatDate(sale.sale_date)}</td>
                      <td>{sale.customer_name || "عميل نقدي"}</td>
                      <td>{sale.branch_name || "-"}</td>
                      <td>{sale.items_count}</td>
                      <td>{formatCurrency(sale.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "profit" && profitReport && (
          <div className="profit-report">
            <h2>تقرير الأرباح</h2>

            {/* ملخص الأرباح */}
            <div className="profit-summary">
              <div className="profit-card primary">
                <h3>إجمالي الإيرادات</h3>
                <div className="profit-value">{formatCurrency(profitReport.summary.total_revenue)}</div>
              </div>
              <div className="profit-card secondary">
                <h3>إجمالي التكلفة</h3>
                <div className="profit-value">{formatCurrency(profitReport.summary.total_cost)}</div>
              </div>
              <div className="profit-card success">
                <h3>صافي الربح</h3>
                <div className="profit-value">{formatCurrency(profitReport.summary.total_profit)}</div>
              </div>
              <div className="profit-card info">
                <h3>هامش الربح</h3>
                <div className="profit-value">{profitReport.summary.profit_margin.toFixed(2)}%</div>
              </div>
            </div>

            {/* أرباح حسب الفرع */}
            {profitReport.branches.length > 0 && (
              <div className="branch-profit">
                <h3>الأرباح حسب الفرع</h3>
                <div className="branch-cards">
                  {profitReport.branches.map((branch) => (
                    <div key={branch.branch_name} className="branch-card">
                      <h4>{branch.branch_name}</h4>
                      <div className="branch-stats">
                        <div className="stat">
                          <span>المبيعات:</span>
                          <span>{branch.sales_count}</span>
                        </div>
                        <div className="stat">
                          <span>الإيرادات:</span>
                          <span>{formatCurrency(branch.revenue)}</span>
                        </div>
                        <div className="stat">
                          <span>الربح:</span>
                          <span>{formatCurrency(branch.profit)}</span>
                        </div>
                        <div className="stat">
                          <span>الهامش:</span>
                          <span>{branch.profit_margin.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أكثر الأدوية ربحية */}
            {profitReport.top_medicines.length > 0 && (
              <div className="top-medicines">
                <h3>أكثر الأدوية ربحية</h3>
                <div className="medicines-table">
                  <table>
                    <thead>
                      <tr>
                        <th>اسم الدواء</th>
                        <th>الفئة</th>
                        <th>الكمية المباعة</th>
                        <th>الإيرادات</th>
                        <th>التكلفة</th>
                        <th>الربح</th>
                        <th>الهامش</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitReport.top_medicines.map((medicine, index) => (
                        <tr key={index}>
                          <td>{medicine.name}</td>
                          <td>{medicine.category || "-"}</td>
                          <td>{medicine.total_qty}</td>
                          <td>{formatCurrency(medicine.total_revenue)}</td>
                          <td>{formatCurrency(medicine.total_cost)}</td>
                          <td>{formatCurrency(medicine.total_profit)}</td>
                          <td>{medicine.profit_margin.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
