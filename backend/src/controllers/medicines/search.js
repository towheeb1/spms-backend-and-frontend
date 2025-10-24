// backend/src/controllers/medicines/search.js
import { pool } from "../../db.js";

async function tableExists(name) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [name]
  );
  return (rows?.[0]?.c || 0) > 0;
}

export async function searchMedicines(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const q = String(req.query?.q || "").trim();
    if (!q || q.length < 2) {
      return res.json({ items: [] });
    }

    if (!(await tableExists("medicines"))) {
      return res.json({ items: [] });
    }

    const like = `%${q}%`;
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        generic_name,
        form,
        strength,
        barcode,
        price,
        stock_qty
      FROM medicines
      WHERE pharmacy_id = ? AND (name LIKE ? OR generic_name LIKE ? OR barcode = ?)
      ORDER BY name
      LIMIT 25
      `,
      [pharmacy_id, like, like, q]
    );

    const norm = (rows || []).map(r => {
      // Map DB columns to a stable, frontend-friendly API shape
      const price = r.price === null ? 0 : Number(r.price);
      const stock = r.stock_qty === null ? 0 : Number(r.stock_qty);
      const stockBase = r.stock_base_qty === null ? stock : Number(r.stock_base_qty);
      const min_stock = r.min_stock ?? r.min_stock_qty ?? 0;
      return {
        id: r.id,
        // prefer an explicit trade_name, fallback to name
        trade_name: r.trade_name || r.name || null,
        generic_name: r.generic_name || null,
        form: r.form || null,
        strength: r.strength || null,
        barcode: r.barcode || null,
        price,
        stock,
        stock_base_qty: stockBase,
        min_stock: Number(min_stock || 0),
        category: r.category || null,
        manufacturer: r.manufacturer || r.brand || null,
        dosage: r.dosage || r.dosage_form || null,
        atc: r.atc || null,
        created_at: r.created_at ? new Date(r.created_at).toISOString().slice(0,10) : r.created_at,
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString().slice(0,10) : r.updated_at,
      };
    });

    return res.json({ items: norm });
  } catch (e) {
    console.error("searchMedicines error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function listMedicines(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const [rows] = await pool.query(
      `SELECT 
     m.id,
  m.name,
  m.generic_name,
  m.form,
  m.strength,
  m.barcode,
  m.price,
  m.stock_qty,
  m.stock_base_qty,
  m.category,
  m.manufacturer,
  m.batch_no,
  m.expiry_date,                 
  poi.expiry_date AS latest_expiry_date,  
  m.location,
  m.notes,
  m.min_stock,
  m.max_stock,
  m.is_active,
  m.created_at,
  m.updated_at,
  poi.wholesale_price,
  poi.retail_price,
  poi.carton_price,
  poi.blister_price,
  poi.tablet_price,
  poi.packs_per_carton,
  poi.blisters_per_pack,
  poi.tablets_per_blister
FROM medicines m
LEFT JOIN purchase_order_items poi 
    ON (
        (m.barcode IS NOT NULL AND m.barcode = poi.barcode) 
        OR 
        (m.barcode IS NULL AND m.name = poi.item_name)
    )
    AND poi.id = (
        SELECT MAX(poi2.id)
        FROM purchase_order_items poi2
        WHERE 
            (m.barcode IS NOT NULL AND m.barcode = poi2.barcode)
            OR 
            (m.barcode IS NULL AND m.name = poi2.item_name)
    )
WHERE m.pharmacy_id = ? 
  AND m.is_active = 1
ORDER BY m.name
LIMIT 500;`,
      [pharmacy_id]
    );

    const norm = (rows || []).map(r => {
      const price = r.price === null ? 0 : Number(r.price);
      const stock = r.stock_qty === null ? 0 : Number(r.stock_qty);
      const min_stock = r.min_stock ?? r.min_stock_qty ?? 0;

      return {
        id: r.id,
        name: r.name || null,
        generic_name: r.generic_name || null,
        form: r.form || null,
        strength: r.strength || null,
        barcode: r.barcode || null,
        price, // سعر البيع
        stock,
        min_stock: Number(min_stock || 0),
        max_stock: Number(r.max_stock || 0),
        category: r.category || null,
        manufacturer: r.manufacturer || null,
        batch_no: r.batch_no || null,
        expiry_date: r.expiry_date || null,
        location: r.location || null,
        notes: r.notes || null,
        is_active: Boolean(r.is_active),
        wholesale_price: r.wholesale_price === null ? null : Number(r.wholesale_price),
        retail_price: r.retail_price === null ? null : Number(r.retail_price),
        carton_price: r.carton_price === null ? null : Number(r.carton_price),
        blister_price: r.blister_price === null ? null : Number(r.blister_price),
        tablet_price: r.tablet_price === null ? null : Number(r.tablet_price),
        packs_per_carton: r.packs_per_carton === null ? null : Number(r.packs_per_carton),
        blisters_per_pack: r.blisters_per_pack === null ? null : Number(r.blisters_per_pack),
        tablets_per_blister: r.tablets_per_blister === null ? null : Number(r.tablets_per_blister),
        created_at: r.created_at ? new Date(r.created_at).toISOString().slice(0,10) : r.created_at,
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString().slice(0,10) : r.updated_at,
      };
    });

    res.json({ items: norm });
  } catch (e) {
    console.error("listMedicines error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function listPurchaseOrderItems(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const [rows] = await pool.query(
      `SELECT
        poi.id, poi.po_id, poi.medicine_id, poi.qty, poi.unit_price, poi.line_total,
        poi.item_name, poi.barcode, poi.batch_no, poi.expiry_date,
        poi.generic_name, poi.form, poi.strength, poi.manufacturer, poi.location, poi.notes,
        poi.min_stock, poi.max_stock, poi.wholesale_price, poi.retail_price,
        poi.carton_price, poi.blister_price, poi.tablet_price,
        poi.packs_per_carton, poi.blisters_per_pack, poi.tablets_per_blister,
        po.supplier_id, po.status as po_status, po.order_date
       FROM purchase_order_items poi
       JOIN purchase_orders po ON po.id = poi.po_id
       WHERE po.pharmacy_id = ? AND po.status IN ('ordered', 'received')
       ORDER BY poi.item_name, po.order_date DESC LIMIT 500`,
      [pharmacy_id]
    );

    const norm = (rows || []).map(r => {
      const unitPrice = r.unit_price === null ? 0 : Number(r.unit_price);
      const qty = r.qty === null ? 0 : Number(r.qty);
      const lineTotal = r.line_total === null ? 0 : Number(r.line_total);

      return {
        id: r.id,
        po_id: r.po_id,
        medicine_id: r.medicine_id,
        name: r.item_name || null,
        generic_name: r.generic_name || null,
        form: r.form || null,
        strength: r.strength || null,
        barcode: r.barcode || null,
        price: unitPrice,
        stock: qty, // استخدام qty كـ stock للتوافق
        manufacturer: r.manufacturer || null,
        batch_no: r.batch_no || null,
        expiry_date: r.expiry_date || null,
        location: r.location || null,
        notes: r.notes || null,
        min_stock: Number(r.min_stock || 0),
        max_stock: Number(r.max_stock || 0),
        wholesale_price: Number(r.wholesale_price || 0),
        retail_price: Number(r.retail_price || 0),
        carton_price: Number(r.carton_price || 0),
        blister_price: Number(r.blister_price || 0),
        tablet_price: Number(r.tablet_price || 0),
        packs_per_carton: Number(r.packs_per_carton || 0),
        blisters_per_pack: Number(r.blisters_per_pack || 0),
        tablets_per_blister: Number(r.tablets_per_blister || 0),
        is_active: true, // افتراضياً نشط
        supplier_id: r.supplier_id,
        po_status: r.po_status,
        order_date: r.order_date,
        qty: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
    });

    res.json({ items: norm });
  } catch (e) {
    console.error("listPurchaseOrderItems error:", e);
    res.status(500).json({ error: "Server error" });
  }
}