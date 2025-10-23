// backend/src/controllers/inventory/movements.js
import { pool } from "../../db.js";

export async function listMovements(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id || null;
    const medicine_id = req.query.medicine_id ? Number(req.query.medicine_id) : null;
    let rows;
    if (medicine_id) {
      [rows] = await pool.query(
        `SELECT m.id, m.medicine_id, m.qty_change, m.reason, m.ref_type, m.ref_id, m.notes, m.created_at,
                md.name AS medicine_name
         FROM inventory_movements m
         JOIN medicines md ON md.id = m.medicine_id
         WHERE m.medicine_id=? AND m.pharmacy_id = ?
         ORDER BY m.id DESC
         LIMIT 500`,
        [medicine_id, pharmacy_id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT m.id, m.medicine_id, m.qty_change, m.reason, m.ref_type, m.ref_id, m.notes, m.created_at,
                md.name AS medicine_name
         FROM inventory_movements m
         JOIN medicines md ON md.id = m.medicine_id
         WHERE m.pharmacy_id = ?
         ORDER BY m.id DESC
         LIMIT 500`
      , [pharmacy_id]);
    }
    res.json({ list: rows });
  } catch (e) {
    console.error("listMovements error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
