// backend/src/controllers/pharmacist/dashboard.js
import { pool } from "../../db.js";

const PERIODS = {
  today: { key: "today", days: 1, label: "اليوم" },
  "7d": { key: "7d", days: 7, label: "آخر 7 أيام" },
  "30d": { key: "30d", days: 30, label: "آخر 30 يوم" },
  "90d": { key: "90d", days: 90, label: "آخر 90 يوم" },
};

function resolvePeriod(raw) {
  if (!raw) return PERIODS["7d"];
  return PERIODS[raw] || PERIODS["7d"];
}

function buildDateRange(period) {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  start.setDate(start.getDate() - (period.days - 1));
  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
  };
}

function getDateRange(period) {
  const now = new Date();
  const start = new Date(now);

  switch(period) {
    case 'today':
      start.setHours(0,0,0,0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0]
  };
}

export async function dashboard(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id || null;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const branchId = req.query?.branch_id ? Number(req.query.branch_id) : null;
    const period = req.query?.period || '7d';

    // Date range calculation based on period
    const dateRange = getDateRange(period);
    const branchFilter = branchId ? `AND branch_id = ${branchId}` : '';

    // KPIs queries with branch filter
    const [[meds]] = await pool.query(
      `SELECT COUNT(*) AS c FROM medicines WHERE pharmacy_id = ? ${branchFilter}`,
      [pharmacy_id]
    );

    const [[low]] = await pool.query(
      `SELECT COUNT(*) AS c FROM medicines WHERE stock_qty <= 0 AND pharmacy_id = ? ${branchFilter}`,
      [pharmacy_id]
    );

    const [[sup]] = await pool.query(`SELECT COUNT(*) AS c FROM suppliers WHERE pharmacy_id = ?`, [pharmacy_id]);

    // Sales data with date range and branch filter
    const [[salesToday]] = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS total
       FROM sales
       WHERE pharmacy_id = ?
       ${branchFilter}
       AND DATE(sale_date) BETWEEN ? AND ?
       AND status = 'posted'`,
      [pharmacy_id, dateRange.startDate, dateRange.endDate]
    );

    // Purchase orders analytics
    const purchaseParams = branchId
      ? [pharmacy_id, dateRange.startDate, dateRange.endDate, branchId]
      : [pharmacy_id, dateRange.startDate, dateRange.endDate];
    const branchFilterPo = branchId ? " AND (po.branch_id = ? OR po.branch_id IS NULL)" : "";

    const [[purchaseSummary]] = await pool.query(
      `SELECT COUNT(*) AS orders_count,
              COALESCE(SUM(po.total), 0) AS total_value,
              COALESCE(AVG(po.total), 0) AS avg_value
       FROM purchase_orders po
       WHERE po.pharmacy_id = ? AND po.order_date BETWEEN ? AND ?${branchFilterPo}`,
      purchaseParams
    );

    const [purchaseChartRows] = await pool.query(
      `SELECT DATE(po.order_date) AS day,
              COALESCE(SUM(po.total), 0) AS total
       FROM purchase_orders po
       WHERE po.pharmacy_id = ? AND po.order_date BETWEEN ? AND ?${branchFilterPo}
       GROUP BY DATE(po.order_date)
       ORDER BY DATE(po.order_date)`,
      purchaseParams
    );

    // Sales payments analytics
    const salesParams = branchId
      ? [pharmacy_id, dateRange.startDate, dateRange.endDate, branchId]
      : [pharmacy_id, dateRange.startDate, dateRange.endDate];
    const branchFilterSales = branchId ? " AND s.branch_id = ?" : "";

    const [[salesSummary]] = await pool.query(
      `SELECT COUNT(*) AS invoice_count,
              COALESCE(SUM(s.total), 0) AS total_value
       FROM sales s
       WHERE s.pharmacy_id = ?
         AND s.status = 'posted'
         AND s.sale_date BETWEEN ? AND ?${branchFilterSales}`,
      salesParams
    );

    const [salesChartRows] = await pool.query(
      `SELECT DATE(s.sale_date) AS day,
              COALESCE(SUM(s.total), 0) AS total
       FROM sales s
       WHERE s.pharmacy_id = ?
         AND s.status = 'posted'
         AND s.sale_date BETWEEN ? AND ?${branchFilterSales}
       GROUP BY DATE(s.sale_date)
       ORDER BY DATE(s.sale_date)`,
      salesParams
    );

    const [paymentMethodRows] = await pool.query(
      `SELECT pm.name AS method,
              COALESCE(SUM(pp.amount), 0) AS total
       FROM pos_payments pp
       JOIN payment_methods pm ON pm.id = pp.method_id
       JOIN sales s ON s.id = pp.sale_id
       WHERE s.pharmacy_id = ?
         AND s.status = 'posted'
         AND DATE(pp.received_at) BETWEEN ? AND ?${branchFilterSales}
       GROUP BY pm.name
       ORDER BY total DESC` ,
      salesParams
    );

    const [[paymentsCount]] = await pool.query(
      `SELECT COUNT(*) AS payment_count
       FROM pos_payments pp
       JOIN sales s ON s.id = pp.sale_id
       WHERE s.pharmacy_id = ?
         AND s.status = 'posted'
         AND DATE(pp.received_at) BETWEEN ? AND ?${branchFilterSales}`,
      salesParams
    );

    // Returns summary (sales marked as returned)
    const [[returnsSummary]] = await pool.query(
      `SELECT COUNT(*) AS returns_count,
              COALESCE(SUM(s.total), 0) AS total_returns
       FROM sales s
       WHERE s.pharmacy_id = ?
         AND s.status = 'returned'
         AND s.sale_date BETWEEN ? AND ?${branchFilterSales}`,
      salesParams
    );

    // Outstanding purchase orders (amount remaining)
    const [[openPurchaseSummary]] = await pool.query(
      `SELECT COALESCE(SUM(po.amount_remaining), 0) AS amount_remaining,
              COUNT(*) AS po_count
       FROM purchase_orders po
       WHERE po.pharmacy_id = ?${branchFilterPo}`,
      branchId ? [pharmacy_id, branchId] : [pharmacy_id]
    );

    const totalPurchaseValue = Number(purchaseSummary?.total_value || 0);
    const purchaseOrdersCount = Number(purchaseSummary?.orders_count || 0);
    const avgPurchaseOrder = purchaseOrdersCount > 0 ? totalPurchaseValue / purchaseOrdersCount : 0;

    const totalSalesValue = Number(salesSummary?.total_value || 0);
    const salesInvoiceCount = Number(salesSummary?.invoice_count || 0);
    const avgInvoiceValue = salesInvoiceCount > 0 ? totalSalesValue / salesInvoiceCount : 0;

    const totalPaymentsCount = Number(paymentsCount?.payment_count || 0);

    const totalReturnsValue = Number(returnsSummary?.total_returns || 0);
    const returnsCount = Number(returnsSummary?.returns_count || 0);

    const outstandingAmount = Number(openPurchaseSummary?.amount_remaining || 0);
    const outstandingCount = Number(openPurchaseSummary?.po_count || 0);

    const receiptsTotal = paymentMethodRows.reduce((acc, row) => acc + Number(row.total || 0), 0);

    // Profit approximation (posted sales - returns)
    const grossProfit = totalSalesValue - totalReturnsValue;

    // Recent movements
    const movementsParams = branchId ? [pharmacy_id, branchId] : [pharmacy_id];
    const branchFilterMovements = branchId ? " AND (m.branch_id = ? OR m.branch_id IS NULL)" : "";
    const [movements] = await pool.query(
      `SELECT m.id, m.created_at, m.reason, m.qty_change, md.name AS medicine_name
       FROM inventory_movements m
       JOIN medicines md ON md.id = m.medicine_id
       WHERE m.pharmacy_id = ?${branchFilterMovements}
       ORDER BY m.id DESC
       LIMIT 10`,
      movementsParams
    );

    // Top 10 medicines by stock
    const [topMeds] = await pool.query(
      `SELECT id, name, stock_qty, price
       FROM medicines
       WHERE pharmacy_id = ?
       ORDER BY stock_qty DESC, id DESC
       LIMIT 10`,
      [pharmacy_id]
    );

    // Return data including the applied filters
    res.json({
      filters: { branchId, period },
      kpis: {
        medicines: Number(meds?.c || 0),
        lowStock: Number(low?.c || 0),
        suppliers: Number(sup?.c || 0),
        salesToday: Number(salesToday?.total || 0),
      },
      analytics: {
        purchasePrices: {
          title: "إجمالي المشتريات",
          period: period,
          totalValue: totalPurchaseValue,
          chartData: purchaseChartRows.map((row) => ({
            name: row.day,
            value: Number(row.total || 0),
          })),
          stats: [
            { label: "عدد الطلبات", value: purchaseOrdersCount },
            { label: "متوسط الطلب", value: avgPurchaseOrder },
          ],
        },
        receipts: {
          title: "طرق الدفع",
          period: period,
          totalValue: receiptsTotal,
          chartData: paymentMethodRows.map((row) => ({
            name: row.method || "غير محدد",
            value: Number(row.total || 0),
          })),
          stats: [
            { label: "عدد المدفوعات", value: totalPaymentsCount },
            { label: "متوسط الفاتورة", value: avgInvoiceValue },
          ],
        },
        payments: {
          title: "مبيعات محققة",
          period: period,
          totalValue: totalSalesValue,
          chartData: salesChartRows.map((row) => ({
            name: row.day,
            value: Number(row.total || 0),
          })),
          stats: [
            { label: "عدد الفواتير", value: salesInvoiceCount },
            { label: "متوسط الفاتورة", value: avgInvoiceValue },
          ],
        },
        returns: {
          title: "مرتجعات المبيعات",
          period: period,
          totalValue: totalReturnsValue,
          count: returnsCount,
        },
        profit: {
          title: "صافي ربح تقريبي",
          period: period,
          totalValue: Number(grossProfit || 0),
        },
        purchaseOrder: {
          title: "مستحقات الموردين",
          period: period,
          totalValue: outstandingAmount,
          count: outstandingCount,
        },
      },
      recentMovements: movements,
      topMedicines: topMeds,
    });

  } catch (e) {
    console.error("pharmacist dashboard error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
