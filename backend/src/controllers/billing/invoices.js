// backend/src/controllers/billing/invoices.js
import { pool } from "../../db.js";

function ensurePharmacy(req, res) {
  const pharmacyId = req.user?.pharmacy_id || null;
  if (!pharmacyId) {
    res.status(403).json({ error: "Unauthorized" });
    return null;
  }
  return pharmacyId;
}

function mapInvoiceMetadata(row) {
  const addressParts = [
    row.pharmacy_address_line1,
    row.pharmacy_address_line2,
    row.pharmacy_city,
    row.pharmacy_state,
    row.pharmacy_country,
  ].filter(Boolean);

  return {
    id: row.id,
    sale_date: row.sale_date?.toISOString?.() ?? row.sale_date,
    total: Number(row.total || 0),
    status: row.status,
    register_id: row.register_id ?? null,
    shift_id: row.shift_id ?? null,
    notes: row.notes || null,
    pharmacy: {
      id: row.pharmacy_id,
      name: row.pharmacy_display_name || row.pharmacy_name || null,
      legal_name: row.pharmacy_name || null,
      address: addressParts.join("، "),
      address_line1: row.pharmacy_address_line1 || null,
      address_line2: row.pharmacy_address_line2 || null,
      city: row.pharmacy_city || null,
      state: row.pharmacy_state || null,
      country: row.pharmacy_country || null,
      branches_json: row.pharmacy_branches_json || null,
      phone: row.owner_phone || null,
      tax_number: row.pharmacy_tax_number || null,
    },
    branch: row.branch_id
      ? {
          id: row.branch_id,
          name: row.branch_name || null,
          code: row.branch_code || null,
          city: row.branch_city || null,
          address: row.branch_address || null,
        }
      : null,
    customer: row.customer_id
      ? {
          id: row.customer_id,
          name: row.customer_name || null,
          phone: row.customer_phone || null,
          email: row.customer_email || null,
        }
      : row.customer_name
      ? {
          id: null,
          name: row.customer_name,
          phone: null,
          email: null,
        }
      : null,
  };
}

function mapInvoiceItems(rows) {
  return rows.map((row) => ({
    id: row.id,
    sale_id: row.sale_id,
    medicine_id: row.medicine_id,
    name: row.medicine_name || null,
    barcode: row.medicine_barcode || null,
    batch_no: row.medicine_batch_no || null,
    expiry_date: row.medicine_expiry_date || null,
    qty: Number(row.qty || 0),
    unit_price: Number(row.unit_price || 0),
    line_total: Number(row.line_total || 0),
    unit_type: row.unit_type || null,
    unit_label: row.unit_label || null,
    unit_qty: row.unit_qty != null ? Number(row.unit_qty) : null,
    base_qty_change: row.base_qty_change != null ? Number(Math.abs(row.base_qty_change)) : null,
  }));
}

function mapInvoicePayments(rows) {
  return rows.map((row) => ({
    id: row.id,
    sale_id: row.sale_id,
    method_id: row.method_id,
    method_name: row.method_name || null,
    amount: Number(row.amount || 0),
    received_at: row.received_at?.toISOString?.() ?? row.received_at,
    received_by: row.received_by || null,
    is_change: !!row.is_change,
    reference: row.reference || null,
  }));
}

export async function getInvoiceDetails(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;

  const saleId = Number(req.params?.id || req.params?.saleId || req.query?.sale_id || req.query?.id);
  if (!Number.isFinite(saleId) || saleId <= 0) {
    res.status(400).json({ error: "رقم الفاتورة غير صالح" });
    return;
  }

  try {
    const [[meta]] = await pool.query(
      `SELECT
         s.id,
         s.sale_date,
         s.total,
         s.status,
         s.notes,
         s.customer_id,
         s.branch_id,
         s.register_id,
         s.shift_id,
         s.pharmacy_id,
         s.customer_name,
         c.full_name AS customer_name_full,
         c.phone AS customer_phone,
         c.email AS customer_email,
         b.name AS branch_name,
         b.code AS branch_code,
         b.city AS branch_city,
         b.address AS branch_address,
         p.name AS pharmacy_name,
         p.display_name AS pharmacy_display_name,
         p.address_line1 AS pharmacy_address_line1,
         p.address_line2 AS pharmacy_address_line2,
         p.city AS pharmacy_city,
         p.state AS pharmacy_state,
         p.country AS pharmacy_country,
         p.branches AS pharmacy_branches_json,
         p.tax_number AS pharmacy_tax_number,
         owner.phone AS owner_phone
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       LEFT JOIN branches b ON b.id = s.branch_id
       LEFT JOIN pharmacies p ON p.id = s.pharmacy_id
       LEFT JOIN pharmacists owner ON owner.id = p.owner_pharmacist_id
       WHERE s.id = ? AND s.pharmacy_id = ?
       LIMIT 1`,
      [saleId, pharmacyId]
    );

    if (!meta) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }

    const [itemRows] = await pool.query(
      `SELECT
         si.id,
         si.sale_id,
         si.medicine_id,
         si.qty,
         si.unit_price,
         si.line_total,
         md.name AS medicine_name,
         md.barcode AS medicine_barcode,
         md.batch_no AS medicine_batch_no,
         md.expiry_date AS medicine_expiry_date,
         im.unit_type,
         im.unit_label,
         im.unit_qty,
         im.base_qty_change
       FROM sale_items si
       LEFT JOIN medicines md ON md.id = si.medicine_id
       LEFT JOIN (
         SELECT
           sale_id,
           medicine_id,
           MAX(unit_type) AS unit_type,
           MAX(unit_label) AS unit_label,
           MAX(unit_qty) AS unit_qty,
           MAX(base_qty_change) AS base_qty_change
         FROM inventory_movements
         WHERE sale_id = ?
           AND ref_type = 'SO'
         GROUP BY sale_id, medicine_id
       ) im ON im.sale_id = si.sale_id AND im.medicine_id = si.medicine_id
       WHERE si.sale_id = ?
       ORDER BY si.id`,
      [saleId, saleId]
    );

    const [paymentRows] = await pool.query(
      `SELECT
         pp.id,
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
       WHERE pp.sale_id = ?
       ORDER BY pp.received_at ASC, pp.id ASC`,
      [saleId]
    );

    const invoice = mapInvoiceMetadata({
      ...meta,
      customer_name: meta.customer_name_full || meta.customer_name,
    });

    res.json({
      invoice,
      items: mapInvoiceItems(itemRows),
      payments: mapInvoicePayments(paymentRows),
    });
  } catch (error) {
    console.error("getInvoiceDetails error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات الفاتورة" });
  }
}
