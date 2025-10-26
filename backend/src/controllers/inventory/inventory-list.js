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
      `SELECT
         md.id,
         md.name AS trade_name,
         cat.name AS category_name,
         md.stock_qty AS qty,
         md.price,
         md.expiry_date,
         md.min_stock,
         md.updated_at,
         md.barcode,
         md.batch_no
       FROM medicines md
       LEFT JOIN categories cat ON cat.id = md.category_id
       WHERE md.pharmacy_id = ?
       ORDER BY md.name ASC
       LIMIT 1000`,
      [pharmacy_id]
    );

    const list = rows.map((r) => {
      const expiryDate = r.expiry_date ? new Date(r.expiry_date).toISOString().slice(0, 10) : null;
      const lastUpdated = r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString();

      return {
        id: Number(r.id),
        medicine_id: Number(r.id),
        trade_name: r.trade_name,
        category: r.category_name || null,
        qty: Number(r.qty ?? 0),
        price: Number(r.price ?? 0),
        expiry: expiryDate,
        nearest_expiry: expiryDate,
        min_stock: Number(r.min_stock ?? 0),
        last_updated: lastUpdated,
        barcode: r.barcode || null,
        batch_number: r.batch_no || null,
        items: [],
      };
    });

    res.json({ list });
  } catch (e) {
    console.error("listInventory error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
