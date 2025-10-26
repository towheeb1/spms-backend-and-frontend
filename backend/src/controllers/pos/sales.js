// backend/src/controllers/pos/sales.js
import { pool } from "../../db.js";

const UNIT_KEYS = ["carton", "pack", "blister", "tablet"];

function normalizeUnit(unit, fallback = "tablet") {
  if (!unit) return fallback;
  const value = String(unit).toLowerCase();
  return UNIT_KEYS.includes(value) ? value : fallback;
}

function getUnitMultiplier(unit, config = {}) {
  const packsPerCarton = Number(config?.packs_per_carton) || 1;
  const blistersPerPack = Number(config?.blisters_per_pack) || 1;
  const tabletsPerBlister = Number(config?.tablets_per_blister) || 1;

  switch (normalizeUnit(unit)) {
    case "carton":
      return packsPerCarton * blistersPerPack * tabletsPerBlister || 1;
    case "pack":
      return blistersPerPack * tabletsPerBlister || 1;
    case "blister":
      return tabletsPerBlister || 1;
    default:
      return 1;
  }
}

function computeBaseQuantity(unit, qty, config) {
  const multiplier = getUnitMultiplier(unit, config);
  const quantity = Number(qty) || 0;
  return quantity * multiplier;
}

function unitLabel(unit) {
  switch (normalizeUnit(unit)) {
    case "carton":
      return "كرتون";
    case "pack":
      return "باكت";
    case "blister":
      return "شريط";
    case "tablet":
    default:
      return "حبة";
  }
}

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

function normalizeLine(item) {
  const qty = Number(item.qty || item.quantity || 0);
  const unitPrice = Number(item.unit_price ?? item.price ?? item.unitPrice ?? 0);
  const lineTotal = Number(item.line_total ?? item.lineTotal ?? qty * unitPrice);
  const unitType = normalizeUnit(item.unit_type ?? item.unitType ?? item.unit ?? "pack");
  const label = unitLabel(unitType);
  return {
    medicine_id: item.medicine_id ?? item.id ?? null,
    qty,
    unit_price: unitPrice,
    line_total: lineTotal,
    unit_type: unitType,
    unit_label: label,
  };
}

async function mapSaleResponse(connection, saleId, pharmacyId, invoiceFallback, itemsFallback = []) {
  const [[sale]] = await connection.query(
    `SELECT s.id,
            s.sale_date,
            s.total,
            s.status,
            s.customer_id,
            s.notes,
            s.branch_id,
            s.register_id,
            s.shift_id,
            s.pharmacy_id,
            s.created_at,
            c.full_name AS customer_name
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
      WHERE s.id = ? AND s.pharmacy_id = ?
      LIMIT 1`,
    [saleId, pharmacyId]
  );

  if (!sale) {
    return {
      invoice: invoiceFallback,
      items: itemsFallback,
      payments: [],
    };
  }

  const [items] = await connection.query(
    `SELECT si.id,
            si.sale_id,
            si.medicine_id,
            si.qty,
            si.unit_price,
            si.line_total,
            si.unit_type,
            si.unit_label,
            m.name AS medicine_name
       FROM sale_items si
       LEFT JOIN medicines m ON m.id = si.medicine_id
      WHERE si.sale_id = ?
      ORDER BY si.id`,
    [saleId]
  );

  const [payments] = await connection.query(
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
      WHERE pp.sale_id = ?
      ORDER BY pp.received_at ASC, pp.id ASC`,
    [saleId]
  );

  const invoice = mapSaleRow(sale);
  const mappedItems = items.map((row) => ({
    id: row.id,
    sale_id: row.sale_id,
    medicine_id: row.medicine_id,
    qty: Number(row.qty || 0),
    unit_price: Number(row.unit_price || 0),
    line_total: Number(row.line_total || 0),
    unit_type: row.unit_type,
    unit_label: row.unit_label || null,
    medicine_name: row.medicine_name || null,
  }));

  const mappedPayments = payments.map((row) => ({
    id: row.id,
    sale_id: row.sale_id,
    method_id: row.method_id,
    amount: Number(row.amount || 0),
    received_at: toIso(row.received_at),
    received_by: row.received_by,
    is_change: !!row.is_change,
    reference: row.reference || null,
    method_name: row.method_name || null,
  }));

  return { invoice, items: mappedItems, payments: mappedPayments };
}

function mapSaleRow(row) {
  return {
    id: row.id,
    sale_date: toIso(row.sale_date),
    total: Number(row.total || 0),
    status: row.status,
    customer_id: row.customer_id,
    customer_name: row.customer_name || null,
    notes: row.notes || null,
    branch_id: row.branch_id,
    register_id: row.register_id,
    shift_id: row.shift_id,
    pharmacy_id: row.pharmacy_id,
    created_at: toIso(row.created_at),
  };
}

export async function listSales(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;
  try {
    const { status, from, to, customer } = req.query || {};
    const filters = [pharmacyId];
    let where = "WHERE s.pharmacy_id = ?";

    if (status) {
      filters.push(status);
      where += " AND s.status = ?";
    }
    if (from) {
      filters.push(from);
      where += " AND DATE(s.sale_date) >= ?";
    }
    if (to) {
      filters.push(to);
      where += " AND DATE(s.sale_date) <= ?";
    }
    if (customer) {
      const numericCustomer = Number(customer);
      filters.push(`%${customer}%`);
      if (Number.isFinite(numericCustomer)) {
        filters.push(numericCustomer);
        where += " AND (c.full_name LIKE ? OR s.customer_id = ?)";
      } else {
        where += " AND c.full_name LIKE ?";
      }
    }

    if (!status) {
      where += " AND s.status <> 'draft'";
    }

    const [rows] = await pool.query(
      `SELECT s.id,
              s.sale_date,
              s.total,
              s.status,
              s.customer_id,
              s.notes,
              s.branch_id,
              s.register_id,
              s.shift_id,
              s.pharmacy_id,
              s.created_at,
              c.full_name AS customer_name
         FROM sales s
         LEFT JOIN customers c ON c.id = s.customer_id
        ${where}
        ORDER BY s.sale_date DESC, s.id DESC
        LIMIT 500`,
      filters
    );

    const list = rows.map(mapSaleRow);
    res.json({ list });
  } catch (error) {
    console.error("listSales error:", error);
    res.status(500).json({ error: "فشل في تحميل الفواتير" });
  }
}

export async function getSaleById(req, res) {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;
  const saleId = Number(req.params.id);
  if (!Number.isFinite(saleId)) {
    res.status(400).json({ error: "معرّف الفاتورة غير صالح" });
    return;
  }
  try {
    const [[sale]] = await pool.query(
      `SELECT s.id,
              s.sale_date,
              s.total,
              s.status,
              s.customer_id,
              s.notes,
              s.branch_id,
              s.register_id,
              s.shift_id,
              s.pharmacy_id,
              s.created_at,
              c.full_name AS customer_name
         FROM sales s
         LEFT JOIN customers c ON c.id = s.customer_id
        WHERE s.id = ? AND s.pharmacy_id = ?
        LIMIT 1`,
      [saleId, pharmacyId]
    );

    if (!sale) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }

    const [items] = await pool.query(
      `SELECT si.id,
              si.sale_id,
              si.medicine_id,
              si.qty,
              si.unit_price,
              si.line_total,
              m.name AS medicine_name
         FROM sale_items si
         LEFT JOIN medicines m ON m.id = si.medicine_id
        WHERE si.sale_id = ?
        ORDER BY si.id`,
      [saleId]
    );

    const [payments] = await pool.query(
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
        WHERE pp.sale_id = ?
        ORDER BY pp.received_at ASC, pp.id ASC`,
      [saleId]
    );

    const invoice = mapSaleRow(sale);
    const mappedItems = items.map((row) => ({
      id: row.id,
      sale_id: row.sale_id,
      medicine_id: row.medicine_id,
      qty: Number(row.qty || 0),
      unit_price: Number(row.unit_price || 0),
      line_total: Number(row.line_total || 0),
      medicine_name: row.medicine_name || null,
    }));
    const mappedPayments = payments.map((row) => ({
      id: row.id,
      sale_id: row.sale_id,
      method_id: row.method_id,
      amount: Number(row.amount || 0),
      received_at: toIso(row.received_at),
      received_by: row.received_by,
      is_change: !!row.is_change,
      reference: row.reference || null,
      method_name: row.method_name || null,
    }));

    res.json({ id: invoice.id, invoice, items: mappedItems, payments: mappedPayments });
  } catch (error) {
    console.error("getSaleById error:", error);
    res.status(500).json({ error: "فشل في تحميل تفاصيل الفاتورة" });
  }
}

async function createSaleInternal(req, res, status = "posted") {
  const pharmacyId = ensurePharmacy(req, res);
  if (!pharmacyId) return;

  const {
    customer_id = null,
    items = [],
    notes = null,
    branch_id = null,
    register_id = null,
    shift_id = null,
    sale_date = null,
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "يجب إضافة عناصر إلى الفاتورة" });
    return;
  }

  const normalizedItems = items.map(normalizeLine);
  for (const item of normalizedItems) {
    if (!item.medicine_id || !Number.isFinite(item.qty) || item.qty <= 0) {
      res.status(400).json({ error: "بيانات العناصر غير صحيحة" });
      return;
    }
  }

  const total = normalizedItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const saleStatus = status === "draft" ? "draft" : "posted";
    const saleDate = sale_date ? new Date(sale_date) : new Date();

    const [saleResult] = await connection.query(
      `INSERT INTO sales (
         pharmacy_id,
         branch_id,
         register_id,
         shift_id,
         customer_id,
         status,
         total,
         sale_date,
         notes
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pharmacyId,
        branch_id ?? null,
        register_id ?? null,
        shift_id ?? null,
        customer_id ?? null,
        saleStatus,
        total,
        saleDate,
        notes || null,
      ]
    );

    const saleId = saleResult.insertId;

    for (const item of normalizedItems) {
      await connection.query(
        `INSERT INTO sale_items (
           sale_id,
           medicine_id,
           qty,
           unit_price,
           line_total,
           unit_type,
           unit_label
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.medicine_id,
          item.qty,
          item.unit_price,
          item.line_total,
          item.unit_type,
          item.unit_label || null,
        ]
      );
    }

    // تحديث المخزون وإضافة حركات المخزون للمبيعات المؤكدة
    if (status === "posted") {
      for (const item of normalizedItems) {
        const [[medicineRow]] = await connection.query(
          `SELECT id, stock_qty, stock_base_qty, packs_per_carton, blisters_per_pack, tablets_per_blister
             FROM medicines
            WHERE id = ? AND pharmacy_id = ?
            LIMIT 1`,
          [item.medicine_id, pharmacyId]
        );

        if (!medicineRow) {
          throw new Error(`Medicine ${item.medicine_id} not found or not accessible`);
        }

        const baseQtyChange = computeBaseQuantity(item.unit_type, item.qty, medicineRow);
        const currentBase = Number(medicineRow.stock_base_qty ?? medicineRow.stock_qty ?? 0);
        if (baseQtyChange > currentBase) {
          throw new Error(`Insufficient stock for medicine ${item.medicine_id}`);
        }
        const nextBase = currentBase - baseQtyChange;
        item.base_qty = baseQtyChange;

        await connection.query(
          `UPDATE medicines
             SET stock_qty = ?,
                 stock_base_qty = ?,
                 updated_at = NOW()
           WHERE id = ? AND pharmacy_id = ?`,
          [
            nextBase,
            nextBase,
            item.medicine_id,
            pharmacyId
          ]
        );

        await connection.query(
          `INSERT INTO inventory_movements (
             medicine_id,
             branch_id,
             sale_id,
             qty_change,
             reason,
             ref_type,
             ref_id,
             pharmacy_id,
             unit_type,
             unit_label,
             unit_qty,
             base_qty_change,
             balance_after_base,
             ref_number,
             notes
           ) VALUES (?, ?, ?, ?, 'sale', 'SO', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.medicine_id,
            branch_id ?? null,
            saleId,
            -baseQtyChange,
            saleId,
            pharmacyId,
            item.unit_type,
            item.unit_label || null,
            item.qty,
            -baseQtyChange,
            nextBase,
            `SO-${saleId}`,
            null
          ]
        );
      }
    }
    await connection.commit();
    const fallbackInvoice = {
      id: saleId,
      sale_date: toIso(saleDate),
      total,
      status: saleStatus,
      customer_id,
      customer_name: null,
      notes: notes || null,
      branch_id,
      register_id,
      shift_id,
      pharmacy_id: pharmacyId,
      created_at: toIso(new Date()),
    };

    const { invoice, items: mappedItems, payments: mappedPayments } = await mapSaleResponse(
      connection,
      saleId,
      pharmacyId,
      fallbackInvoice,
      normalizedItems
    );

    res.status(201).json({ invoice, items: mappedItems, payments: mappedPayments });
  } catch (error) {
    await connection.rollback();
    console.error("createSale error:", error);
    res.status(500).json({ error: "فشل في حفظ الفاتورة" });
  } finally {
    connection.release();
  }
}

export async function createSale(req, res) {
  return createSaleInternal(req, res, "posted");
}

export async function createDraftSale(req, res) {
  return createSaleInternal(req, res, "draft");
}
