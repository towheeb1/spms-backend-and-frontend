// backend/src/controllers/pos/reports.js
import { pool } from "../../db.js";

function ensurePharmacy(req, res) {
  const pharmacyId = req.user?.pharmacy_id || null;
  if (!pharmacyId) {
    res.status(403).json({ error: "Unauthorized" });
    return null;
  }
  return pharmacyId;
}

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  try {
    return new Date(value).toISOString();
  } catch {
    return value;
  }
}

export async function getProfitReport(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;

  const { from, to, branch_id } = req.query || {};
  const filters = [pharmacyId];
  let where = "WHERE s.pharmacy_id = ? AND s.status = 'posted'";

  if (from) {
    filters.push(from);
    where += " AND DATE(s.sale_date) >= ?";
  }
  if (to) {
    filters.push(to);
    where += " AND DATE(s.sale_date) <= ?";
  }
  if (branch_id) {
    filters.push(branch_id);
    where += " AND s.branch_id = ?";
  }

  try {
    // حساب إجمالي المبيعات والتكلفة والربح
    const [rows] = await pool.query(
      `SELECT
         COUNT(DISTINCT s.id) as total_sales,
         SUM(s.total) as total_revenue,
         COALESCE(SUM(
           si.qty * COALESCE(poi.unit_price, m.price, 0)
         ), 0) as total_cost,
         COALESCE(SUM(
           si.line_total - (si.qty * COALESCE(poi.unit_price, m.price, 0))
         ), 0) as total_profit,
         AVG(s.total) as average_sale
       FROM sales s
       JOIN sale_items si ON si.sale_id = s.id
       LEFT JOIN medicines m ON m.id = si.medicine_id
       LEFT JOIN purchase_order_items poi ON poi.medicine_id = si.medicine_id
         AND poi.id = (
           SELECT MAX(poi2.id) FROM purchase_order_items poi2
           WHERE poi2.medicine_id = si.medicine_id
         )
       ${where}`,
      filters
    );

    const stats = rows[0];

    // تفصيل المبيعات حسب الفرع
    const [branchStats] = await pool.query(
      `SELECT
         b.name as branch_name,
         COUNT(DISTINCT s.id) as sales_count,
         SUM(s.total) as revenue,
         COALESCE(SUM(
           si.qty * COALESCE(poi.unit_price, m.price, 0)
         ), 0) as cost,
         COALESCE(SUM(
           si.line_total - (si.qty * COALESCE(poi.unit_price, m.price, 0))
         ), 0) as profit
       FROM sales s
       JOIN branches b ON b.id = s.branch_id
       JOIN sale_items si ON si.sale_id = s.id
       LEFT JOIN medicines m ON m.id = si.medicine_id
       LEFT JOIN purchase_order_items poi ON poi.medicine_id = si.medicine_id
         AND poi.id = (
           SELECT MAX(poi2.id) FROM purchase_order_items poi2
           WHERE poi2.medicine_id = si.medicine_id
         )
       ${where}
       GROUP BY b.id, b.name
       ORDER BY revenue DESC`,
      filters
    );

    // أكثر الأدوية مبيعاً
    const [topMedicines] = await pool.query(
      `SELECT
         m.name,
         m.category,
         SUM(si.qty) as total_qty,
         SUM(si.line_total) as total_revenue,
         COALESCE(SUM(
           si.qty * COALESCE(poi.unit_price, m.price, 0)
         ), 0) as total_cost,
         COALESCE(SUM(
           si.line_total - (si.qty * COALESCE(poi.unit_price, m.price, 0))
         ), 0) as total_profit
       FROM sale_items si
       JOIN medicines m ON m.id = si.medicine_id
       LEFT JOIN purchase_order_items poi ON poi.medicine_id = si.medicine_id
         AND poi.id = (
           SELECT MAX(poi2.id) FROM purchase_order_items poi2
           WHERE poi2.medicine_id = si.medicine_id
         )
       JOIN sales s ON s.id = si.sale_id
       ${where}
       GROUP BY m.id, m.name, m.category
       ORDER BY total_revenue DESC
       LIMIT 20`,
      filters
    );

    const report = {
      summary: {
        total_sales: Number(stats.total_sales || 0),
        total_revenue: Number(stats.total_revenue || 0),
        total_cost: Number(stats.total_cost || 0),
        total_profit: Number(stats.total_profit || 0),
        profit_margin: stats.total_revenue > 0 ?
          Number(((stats.total_profit / stats.total_revenue) * 100).toFixed(2)) : 0,
        average_sale: Number(stats.average_sale || 0)
      },
      branches: branchStats.map(row => ({
        branch_name: row.branch_name,
        sales_count: Number(row.sales_count || 0),
        revenue: Number(row.revenue || 0),
        cost: Number(row.cost || 0),
        profit: Number(row.profit || 0),
        profit_margin: row.revenue > 0 ?
          Number(((row.profit / row.revenue) * 100).toFixed(2)) : 0
      })),
      top_medicines: topMedicines.map(row => ({
        name: row.name,
        category: row.category,
        total_qty: Number(row.total_qty || 0),
        total_revenue: Number(row.total_revenue || 0),
        total_cost: Number(row.total_cost || 0),
        total_profit: Number(row.total_profit || 0),
        profit_margin: row.total_revenue > 0 ?
          Number(((row.total_profit / row.total_revenue) * 100).toFixed(2)) : 0
      }))
    };

    res.json(report);
  } catch (error) {
    console.error("getProfitReport error:", error);
    res.status(500).json({ error: "فشل في إنشاء تقرير الأرباح" });
  }
}

export async function getSalesReport(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;

  const { from, to, branch_id } = req.query || {};
  const filters = [pharmacyId];
  let where = "WHERE s.pharmacy_id = ? AND s.status = 'posted'";

  if (from) {
    filters.push(from);
    where += " AND DATE(s.sale_date) >= ?";
  }
  if (to) {
    filters.push(to);
    where += " AND DATE(s.sale_date) <= ?";
  }
  if (branch_id) {
    filters.push(branch_id);
    where += " AND s.branch_id = ?";
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         s.id,
         s.sale_date,
         s.total,
         s.status,
         s.customer_id,
         c.full_name as customer_name,
         b.name as branch_name,
         COUNT(si.id) as items_count,
         SUM(si.qty) as total_items_qty
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       LEFT JOIN branches b ON b.id = s.branch_id
       LEFT JOIN sale_items si ON si.sale_id = s.id
       ${where}
       GROUP BY s.id, s.sale_date, s.total, s.status, s.customer_id, c.full_name, b.name
       ORDER BY s.sale_date DESC, s.id DESC
       LIMIT 100`,
      filters
    );

    const report = rows.map(row => ({
      id: row.id,
      sale_date: toIso(row.sale_date),
      total: Number(row.total || 0),
      status: row.status,
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      branch_name: row.branch_name,
      items_count: Number(row.items_count || 0),
      total_items_qty: Number(row.total_items_qty || 0)
    }));

    res.json({ sales: report });
  } catch (error) {
    console.error("getSalesReport error:", error);
    res.status(500).json({ error: "فشل في إنشاء تقرير المبيعات" });
  }
}
