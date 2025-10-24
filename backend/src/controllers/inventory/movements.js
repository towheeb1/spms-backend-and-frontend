// backend/src/controllers/inventory/movements.js
import { pool } from "../../db.js";

export async function listMovements(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id || null;
    const medicine_id = req.query.medicine_id ? Number(req.query.medicine_id) : null;
    let rows;
    if (medicine_id) {
      [rows] = await pool.query(
        `SELECT m.id,
                m.medicine_id,
                m.qty_change,
                m.reason,
                m.ref_type,
                m.ref_id,
                m.notes,
                m.created_at,
                m.unit_type,
                m.unit_label,
                m.unit_qty,
                m.base_qty_change,
                m.balance_after_base,
                m.ref_number,
                md.name AS medicine_name
         FROM inventory_movements m
         JOIN medicines md ON md.id = m.medicine_id
         WHERE m.medicine_id = ? AND m.pharmacy_id = ?
         ORDER BY m.id DESC
         LIMIT 500`,
        [medicine_id, pharmacy_id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT m.id,
                m.medicine_id,
                m.qty_change,
                m.reason,
                m.ref_type,
                m.ref_id,
                m.notes,
                m.created_at,
                m.unit_type,
                m.unit_label,
                m.unit_qty,
                m.base_qty_change,
                m.balance_after_base,
                m.ref_number,
                md.name AS medicine_name
         FROM inventory_movements m
         JOIN medicines md ON md.id = m.medicine_id
         WHERE m.pharmacy_id = ?
         ORDER BY m.id DESC
         LIMIT 500`
      , [pharmacy_id]);
    }
    const list = rows.map((row) => ({
      id: row.id,
      medicine_id: row.medicine_id,
      qty_change: Number(row.qty_change || 0),
      reason: row.reason,
      ref_type: row.ref_type,
      ref_id: row.ref_id,
      notes: row.notes,
      created_at: row.created_at,
      unit_type: row.unit_type || null,
      unit_label: row.unit_label || null,
      unit_qty: row.unit_qty != null ? Number(row.unit_qty) : null,
      base_qty_change: row.base_qty_change != null ? Number(row.base_qty_change) : null,
      balance_after_base: row.balance_after_base != null ? Number(row.balance_after_base) : null,
      ref_number: row.ref_number || null,
      medicine_name: row.medicine_name || null
    }));
    res.json({ list });
  } catch (e) {
    console.error("listMovements error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
