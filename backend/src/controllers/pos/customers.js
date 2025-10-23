// backend/src/controllers/pos/customers.js
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

export async function listCustomers(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;
  try {
    const [rows] = await pool.query(
      `SELECT id,
              full_name,
              phone,
              email,
              tax_number,
              is_active,
              created_at,
              branch_id,
              pharmacy_id
         FROM customers
        WHERE pharmacy_id = ?
        ORDER BY full_name ASC
        LIMIT 500`,
      [pharmacyId]
    );
    const list = rows.map((row) => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      tax_number: row.tax_number,
      is_active: !!row.is_active,
      created_at: toIso(row.created_at),
      branch_id: row.branch_id,
      pharmacy_id: row.pharmacy_id,
    }));
    res.json({ list });
  } catch (error) {
    console.error("listCustomers error:", error);
    res.status(500).json({ error: "فشل في تحميل العملاء" });
  }
}
