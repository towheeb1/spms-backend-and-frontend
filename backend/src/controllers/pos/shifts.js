// backend/src/controllers/pos/shifts.js
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

export async function listShifts(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;
  try {
    const [rows] = await pool.query(
      `SELECT s.id,
              s.register_id,
              r.name AS register_name,
              s.opened_by,
              s.closed_by,
              s.opened_at,
              s.closed_at,
              s.opening_float,
              s.expected_amount,
              s.closing_amount,
              s.notes
         FROM pos_shifts s
         JOIN pos_registers r ON r.id = s.register_id
        WHERE r.pharmacy_id = ?
        ORDER BY s.opened_at DESC
        LIMIT 200`,
      [pharmacyId]
    );
    const list = rows.map((row) => ({
      id: row.id,
      register_id: row.register_id,
      register_name: row.register_name,
      opened_by: row.opened_by,
      closed_by: row.closed_by,
      opened_at: toIso(row.opened_at),
      closed_at: toIso(row.closed_at),
      opening_float: Number(row.opening_float || 0),
      expected_amount: row.expected_amount != null ? Number(row.expected_amount) : null,
      closing_amount: row.closing_amount != null ? Number(row.closing_amount) : null,
      notes: row.notes || null,
    }));
    res.json({ list });
  } catch (error) {
    console.error("listShifts error:", error);
    res.status(500).json({ error: "فشل في تحميل الورديات" });
  }
}
