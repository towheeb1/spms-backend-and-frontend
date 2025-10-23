// backend/src/controllers/inventory/inventory-list.js
import { pool } from "../../db.js";

// Return inventory list derived from medicines table
export async function listInventory(_req, res) {
  try {
    const pharmacy_id = _req.user?.pharmacy_id || null;
    if (!pharmacy_id) {
      return res.json({ list: [] });
    }

    const [rows] = await pool.query(
      `WITH purchase_totals AS (
         SELECT
           COALESCE(poi.medicine_id, -poi.id) AS inventory_id,
           poi.medicine_id,
           COALESCE(MAX(med.name), MAX(poi.item_name)) AS trade_name,
           MAX(cat.name) AS category_name,
           SUM(poi.qty) AS purchased_qty,
           MIN(COALESCE(poi.expiry_date, po.expiry_date)) AS nearest_expiry,
           MAX(poi.unit_price) AS last_unit_price,
           MAX(po.updated_at) AS last_purchase_at,
           MAX(med.updated_at) AS med_updated_at,
           MAX(med.price) AS med_price
         FROM purchase_order_items poi
         JOIN purchase_orders po ON po.id = poi.po_id
         LEFT JOIN medicines med ON med.id = poi.medicine_id AND med.pharmacy_id = po.pharmacy_id
         LEFT JOIN categories cat ON cat.id = med.category_id
         WHERE po.pharmacy_id = ?
         GROUP BY inventory_id, poi.medicine_id
       ), med_base AS (
         SELECT
           md.id,
           md.name,
           md.stock_qty,
           md.price,
           md.updated_at,
           cat.name AS category_name
         FROM medicines md
         LEFT JOIN categories cat ON cat.id = md.category_id
         WHERE md.pharmacy_id = ?
       )
       SELECT
         inv.id,
         inv.medicine_id,
         inv.trade_name,
         inv.category_name,
         inv.base_qty AS qty,
         inv.last_price,
         inv.nearest_expiry,
         inv.last_updated,
         inv.min_stock
       FROM (
         SELECT
           mb.id AS id,
           mb.id AS medicine_id,
           COALESCE(pt.trade_name, mb.name) AS trade_name,
           COALESCE(pt.category_name, mb.category_name) AS category_name,
           mb.stock_qty AS base_qty,
           COALESCE(pt.last_unit_price, pt.med_price, mb.price) AS last_price,
           COALESCE(pt.nearest_expiry, NULL) AS nearest_expiry,
           COALESCE(pt.last_purchase_at, pt.med_updated_at, mb.updated_at) AS last_updated,
           0 AS min_stock
         FROM med_base mb
         LEFT JOIN purchase_totals pt ON pt.medicine_id = mb.id

         UNION ALL

         SELECT
           pt.inventory_id AS id,
           NULL AS medicine_id,
           pt.trade_name,
           pt.category_name,
           COALESCE(pt.purchased_qty,0) AS base_qty,
           COALESCE(pt.last_unit_price, pt.med_price, 0) AS last_price,
           pt.nearest_expiry,
           COALESCE(pt.last_purchase_at, pt.med_updated_at) AS last_updated,
           0 AS min_stock
         FROM purchase_totals pt
         WHERE pt.medicine_id IS NULL
       ) inv
       ORDER BY inv.trade_name ASC
       LIMIT 1000`
    , [pharmacy_id, pharmacy_id]);

    const inventoryIds = rows.map((r) => Number(r.id)).filter((val) => Number.isFinite(val));
    let detailMap = new Map();
    if (inventoryIds.length) {
      const [detailRows] = await pool.query(
        `SELECT
           COALESCE(poi.medicine_id, -poi.id) AS inventory_id,
           poi.medicine_id,
           poi.item_name,
           poi.qty,
           poi.unit,
           poi.unit_price,
           poi.expiry_date,
           po.expiry_date AS po_expiry_date,
           poi.batch_no,
           poi.barcode,
           po.id AS purchase_id,
           po.order_date,
           po.expected_date,
           po.status,
           s.name AS supplier_name
         FROM purchase_order_items poi
         JOIN purchase_orders po ON po.id = poi.po_id
         LEFT JOIN suppliers s ON s.id = po.supplier_id
         WHERE COALESCE(poi.medicine_id, -poi.id) IN (?) AND po.pharmacy_id = ?
         ORDER BY po.order_date DESC, poi.id DESC`
      , [inventoryIds, pharmacy_id]);

      for (const row of detailRows) {
        if (!detailMap.has(row.inventory_id)) detailMap.set(row.inventory_id, []);
        const expirySource = row.expiry_date || row.po_expiry_date;
        const expiryStr = expirySource ? new Date(expirySource).toISOString().slice(0, 10) : null;
        const orderDateStr = row.order_date ? new Date(row.order_date).toISOString().slice(0, 10) : null;
        const expectedDateStr = row.expected_date ? new Date(row.expected_date).toISOString().slice(0, 10) : null;

        detailMap.get(row.inventory_id).push({
          id: row.purchase_id,
          item_name: row.item_name,
          quantity: Number(row.qty || 0),
          unit: row.unit || null,
          unit_price: Number(row.unit_price || 0),
          expiry_date: expiryStr,
          batch_no: row.batch_no || null,
          barcode: row.barcode || null,
          order_date: orderDateStr,
          expected_date: expectedDateStr,
          status: row.status || null,
          supplier_name: row.supplier_name || null,
        });
      }
    }

    const list = rows.map((r) => ({
      id: Number(r.id),
      medicine_id: r.medicine_id ? Number(r.medicine_id) : null,
      trade_name: r.trade_name,
      category: r.category_name || null,
      qty: Number(r.qty ?? 0),
      price: Number(r.last_price ?? 0),
      nearest_expiry: r.nearest_expiry || null,
      min_stock: 0,
      last_updated: r.last_updated ? new Date(r.last_updated).toISOString() : new Date().toISOString(),
      items: detailMap.get(r.id) || [],
    }));

    res.json({ list });
  } catch (e) {
    console.error("listInventory error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
