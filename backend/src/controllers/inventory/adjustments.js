// backend/src/controllers/inventory/adjustments.js
import { pool } from "../../db.js";

export async function adjustStock(medicine_id, qty_change, reason, ref) {
  // Update stock and insert movement in a transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[med]] = await conn.query("SELECT id, stock_qty, pharmacy_id FROM medicines WHERE id=? FOR UPDATE", [medicine_id]);
    if (!med) throw new Error("medicine not found");

    const newQty = (med.stock_qty || 0) + qty_change;
    if (newQty < 0) throw new Error("insufficient stock");

    await conn.query("UPDATE medicines SET stock_qty=? WHERE id=?", [newQty, medicine_id]);
    await conn.query(
      `INSERT INTO inventory_movements (medicine_id, qty_change, reason, ref_type, ref_id, notes, pharmacy_id)
       VALUES (?,?,?,?,?,?,?)`,
      [medicine_id, qty_change, reason, ref?.type || null, ref?.id || null, ref?.notes || null, med.pharmacy_id || null]
    );

    await conn.commit();
    return { stock_qty: newQty };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function stockIn(req, res) {
  try {
    const { medicine_id, qty, note, ref_type, ref_id } = req.body || {};
    const mid = Number(medicine_id);
    const q = Number(qty);
    if (!mid || !Number.isFinite(q) || q <= 0) return res.status(400).json({ error: "medicine_id and positive qty required" });
    const result = await adjustStock(mid, Math.abs(q), "purchase", { type: ref_type || null, id: ref_id || null, notes: note || null });
    res.json({ ok: true, stock_qty: result.stock_qty });
  } catch (e) {
    console.error("stockIn error:", e);
    res.status(400).json({ error: e.message || "Bad request" });
  }
}

export async function stockOut(req, res) {
  try {
    const { medicine_id, qty, note, ref_type, ref_id } = req.body || {};
    const mid = Number(medicine_id);
    const q = Number(qty);
    if (!mid || !Number.isFinite(q) || q <= 0) return res.status(400).json({ error: "medicine_id and positive qty required" });
    const result = await adjustStock(mid, -Math.abs(q), "adjustment", { type: ref_type || null, id: ref_id || null, notes: note || null });
    res.json({ ok: true, stock_qty: result.stock_qty });
  } catch (e) {
    console.error("stockOut error:", e);
    res.status(400).json({ error: e.message || "Bad request" });
  }
}
