// backend/src/controllers/pos/payments.js
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

export async function listPaymentMethods(_req, res) {
  try {
    let [rows] = await pool.query(
      `SELECT id, name, is_cash, is_active
         FROM payment_methods
        ORDER BY id ASC`
    );

    if (!rows.length) {
      const defaults = [
        { name: "نقدي", is_cash: true },
        { name: "بطاقة", is_cash: false },
        { name: "تحويل بنكي", is_cash: false },
      ];

      const values = defaults.map((method) => [method.name, method.is_cash ? 1 : 0, 1]);
      await pool.query(
        `INSERT INTO payment_methods (name, is_cash, is_active)
         VALUES ?`,
        [values]
      );

      [rows] = await pool.query(
        `SELECT id, name, is_cash, is_active
           FROM payment_methods
          ORDER BY id ASC`
      );
    }

    const list = rows.map((row) => ({
      id: row.id,
      name: row.name,
      is_cash: !!row.is_cash,
      is_active: !!row.is_active,
    }));
    res.json({ list });
  } catch (error) {
    console.error("listPaymentMethods error:", error);
    res.status(500).json({ error: "فشل في تحميل طرق الدفع" });
  }
}

export async function addSalePayment(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;

  const saleId = Number(req.params.id);
  if (!Number.isFinite(saleId) || saleId <= 0) {
    res.status(400).json({ error: "معرّف الفاتورة غير صالح" });
    return;
  }

  const { method_id, amount, is_change = false, reference = null } = req.body || {};
  if (!Number.isFinite(Number(amount))) {
    res.status(400).json({ error: "بيانات الدفع غير مكتملة" });
    return;
  }

  try {
    const [[sale]] = await pool.query(
      `SELECT id FROM sales WHERE id = ? AND pharmacy_id = ? LIMIT 1`,
      [saleId, pharmacyId]
    );
    if (!sale) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }

    let paymentMethodId = Number(method_id);
    if (!Number.isFinite(paymentMethodId) || paymentMethodId <= 0) {
      const [[existingCash]] = await pool.query(
        `SELECT id FROM payment_methods WHERE is_cash = 1 LIMIT 1`
      );

      if (existingCash) {
        paymentMethodId = existingCash.id;
      } else {
        const [insertCash] = await pool.query(
          `INSERT INTO payment_methods (name, is_cash, is_active) VALUES (?, 1, 1)`
        , ["نقدي"]);
        paymentMethodId = insertCash.insertId;
      }
    }

    const receivedBy = req.user?.id || null;
    const [result] = await pool.query(
      `INSERT INTO pos_payments (
         sale_id,
         method_id,
         amount,
         received_by,
         is_change,
         reference
       ) VALUES (?, ?, ?, ?, ?, ?)`,
      [saleId, paymentMethodId, Number(amount), receivedBy, is_change ? 1 : 0, reference || null]
    );

    const paymentId = result.insertId;
    const [[paymentRow]] = await pool.query(
      `SELECT pp.id,
              pp.sale_id,
              pp.method_id,
              pp.amount,
              pp.received_at,
              pp.received_by,
              pp.is_change,
              pp.reference,
              pm.name AS method_name
         FROM pos_payments pp
         LEFT JOIN payment_methods pm ON pm.id = pp.method_id
        WHERE pp.id = ?`,
      [paymentId]
    );

    const payment = {
      id: paymentRow.id,
      sale_id: paymentRow.sale_id,
      method_id: paymentRow.method_id,
      amount: Number(paymentRow.amount || 0),
      received_at: toIso(paymentRow.received_at),
      received_by: paymentRow.received_by,
      is_change: !!paymentRow.is_change,
      reference: paymentRow.reference || null,
      method_name: paymentRow.method_name || null,
    };

    res.status(201).json(payment);
  } catch (error) {
    console.error("addSalePayment error:", error);
    res.status(500).json({ error: "فشل في تسجيل الدفع" });
  }
}
