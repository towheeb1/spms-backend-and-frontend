// backend/src/controllers/purchases/create.js
import { pool } from "../../db.js";

const UNIT_KEYS = ["carton", "pack", "blister", "tablet"];

function normalizeUnit(unit, fallback = "carton") {
  if (!unit) return fallback;
  const value = String(unit).toLowerCase();
  return UNIT_KEYS.includes(value) ? value : fallback;
}

function getUnitMultiplier(unit, config) {
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
  const quantity = Number(qty) || 0;
  if (!quantity) return 0;
  const multiplier = getUnitMultiplier(unit, config);
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

export async function createPurchase(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const {
      supplier_id,
      items,
      notes,
      currency,
      exchange_rate,
      supplier_reference,
      order_date,
      expected_date,
      payment_terms,
      shipping_terms,
      total_amount,
      amount_received,
      amount_remaining,
      expiry_date,
    } = req.body || {};

    const sid = Number(supplier_id);
    if (!sid) return res.status(400).json({ error: "supplier_id required" });

    const normalizeNumber = (value, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const normalizeString = (value) => {
      if (value === null || value === undefined) return null;
      const text = String(value).trim();
      return text.length ? text : null;
    };

    const buildItem = (raw, batchNo) => {
      const quantity = normalizeNumber(raw.quantity, 0);
      const wholesale = normalizeNumber(raw.wholesale_price ?? raw.price ?? 0, 0);
      const saleCarton = normalizeNumber(
        raw.carton_price ?? raw.sale_carton_price ?? raw.cartonPrice ?? raw.retail_carton_price ?? wholesale,
        wholesale
      );
      const packsPerCarton = normalizeNumber(raw.packs_per_carton, 0);
      const blistersPerPack = normalizeNumber(raw.blisters_per_pack, 0);
      const tabletsPerBlister = normalizeNumber(raw.tablets_per_blister, 0);

      const purchaseCartonPrice = wholesale;
      const retailPrice = packsPerCarton > 0 ? saleCarton / packsPerCarton : 0;
      const blisterPrice = blistersPerPack > 0 ? retailPrice / blistersPerPack : 0;
      const tabletPrice = tabletsPerBlister > 0 ? blisterPrice / tabletsPerBlister : 0;

      const subtotal = quantity * purchaseCartonPrice;
      const itemExpiry = raw.expiry_date || expiry_date || null;

      return {
    medicine_id: raw.medicine_id ? Number(raw.medicine_id) : null,
    qty: quantity,
    unit_price: purchaseCartonPrice,
    line_total: subtotal,
    item_name: normalizeString(raw.name),
    supplier_item_code: normalizeString(raw.supplier_item_code),
    barcode: normalizeString(raw.barcode),
    batch_no: batchNo,
    expiry_date: itemExpiry, // ← الآن يستخدم تاريخ الطلب إذا لم يُحدد للعنصر
    unit: normalizeString(raw.unit) || "carton",
    discount_percent: normalizeNumber(raw.discount_percent, null),
    discount_value: normalizeNumber(raw.discount_value, null),
    free_qty: normalizeNumber(raw.free_quantity, 0),
    is_bonus: raw.is_bonus ? 1 : 0,
    taxes: raw.taxes ? JSON.stringify(raw.taxes) : null,
    extra_charges_share: normalizeNumber(raw.extra_charges_share, null),
    category: normalizeString(raw.category),
    wholesale_price: purchaseCartonPrice,
    retail_price: retailPrice,
    carton_price: saleCarton,
    blister_price: blisterPrice,
    tablet_price: tabletPrice,
    packs_per_carton: packsPerCarton || null,
    blisters_per_pack: blistersPerPack || null,
    tablets_per_blister: tabletsPerBlister || null,
  };
};
    // Verify supplier belongs to same pharmacy
    const [[sup]] = await pool.query(`SELECT id FROM suppliers WHERE id=? AND pharmacy_id=?`, [sid, pharmacy_id]);
    if (!sup) return res.status(403).json({ error: "Supplier not found" });

    // Compute total from provided items when not provided explicitly
    const preparedItems = Array.isArray(items)
      ? items.map((it, idx) => buildItem(it, it.batch_no || null, expiry_date))
      : [];

    const computedTotal = preparedItems.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);

    const totalToStore = typeof total_amount !== 'undefined' ? Number(total_amount) : computedTotal;

    const received = Number(amount_received || 0);
    const remaining = typeof amount_remaining !== 'undefined'
      ? Number(amount_remaining)
      : Math.max(totalToStore - received, 0);

    const [result] = await pool.query(
      `INSERT INTO purchase_orders (supplier_id, status, total, notes, pharmacy_id, currency, exchange_rate, supplier_reference, order_date, expected_date, payment_terms, shipping_terms, amount_received, amount_remaining, expiry_date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sid, "ordered", totalToStore, notes || null, pharmacy_id, currency || 'YER', Number(exchange_rate) || 1, supplier_reference || null, order_date || null, expected_date || null, payment_terms || null, shipping_terms || null, received, remaining, expiry_date || null]
    );

    const id = result.insertId;

    // Insert items if provided
    if (preparedItems.length > 0) {
      let batchCounter = 1;
      const insertPromises = preparedItems.map((item, idx) => {
        const batchNo = item.batch_no || `${id}-${String(batchCounter++).padStart(3, "0")}`;
        return pool.query(
          `INSERT INTO purchase_order_items (
             po_id,
             medicine_id,
             qty,
             unit_price,
             line_total,
             item_name,
             supplier_item_code,
             barcode,
             batch_no,
             expiry_date,
             unit,
             discount_percent,
             discount_value,
             free_qty,
             is_bonus,
             taxes,
             extra_charges_share,
             category,
             wholesale_price,
             retail_price,
             carton_price,
             blister_price,
             tablet_price,
             packs_per_carton,
             blisters_per_pack,
             tablets_per_blister
           )
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id,
            item.medicine_id,
            item.qty,
            item.unit_price,
            item.line_total,
            item.item_name,
            item.supplier_item_code,
            item.barcode,
            batchNo,
            item.expiry_date,
            item.unit,
            item.discount_percent,
            item.discount_value,
            item.free_qty,
            item.is_bonus,
            item.taxes,
            item.extra_charges_share,
            item.category,
            item.wholesale_price,
            item.retail_price,
            item.carton_price,
            item.blister_price,
            item.tablet_price,
            item.packs_per_carton,
            item.blisters_per_pack,
            item.tablets_per_blister,
          ]
        );
      });
      await Promise.all(insertPromises);
    }

    res.json({ id });
  } catch (e) {
    console.error("createPurchase error:", e);
    res.status(400).json({ error: e.message || "Bad request" });
  }
}

// إضافة دفعة إضافية لأمر شراء
export async function addPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return res.status(400).json({ error: "Invalid amount" });

    // تحقق من الطلب وتحديث
    const [[purchase]] = await pool.query(
      `SELECT id, amount_received, amount_remaining FROM purchase_orders WHERE id = ? AND pharmacy_id = ?`,
      [id, pharmacy_id]
    );
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    const newReceived = purchase.amount_received + paymentAmount;
    const newRemaining = Math.max(0, purchase.amount_remaining - paymentAmount);

    await pool.query(
      `UPDATE purchase_orders SET amount_received = ?, amount_remaining = ? WHERE id = ?`,
      [newReceived, newRemaining, id]
    );

    res.json({ success: true, new_received: newReceived, new_remaining: newRemaining });
  } catch (e) {
    console.error("addPayment error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

// جلب تفاصيل أمر شراء واحد مع العناصر
export async function getPurchase(req, res) {
  try {
    const { id } = req.params;
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    // جلب أمر الشراء الأساسي
    const [[purchase]] = await pool.query(
      `SELECT
        po.id, po.supplier_id, po.status, po.total, po.notes, po.pharmacy_id,
        po.currency, po.exchange_rate, po.supplier_reference, po.order_date,
        po.expected_date, po.payment_terms, po.shipping_terms, po.amount_received,
        po.amount_remaining, po.expiry_date, po.created_at, po.updated_at,
        s.name as supplier_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       WHERE po.id = ? AND po.pharmacy_id = ?`,
      [id, pharmacy_id]
    );

    if (!purchase) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    // جلب عناصر أمر الشراء
    const [items] = await pool.query(
      `SELECT
        poi.id, poi.medicine_id, poi.qty, poi.unit_price, poi.line_total,
        poi.item_name, poi.supplier_item_code, poi.barcode, poi.batch_no,
        poi.expiry_date, poi.unit, poi.discount_percent, poi.discount_value,
        poi.free_qty, poi.is_bonus, poi.taxes, poi.extra_charges_share,
        poi.category, poi.wholesale_price, poi.retail_price, poi.carton_price,
        poi.blister_price, poi.tablet_price, poi.packs_per_carton,
        poi.blisters_per_pack, poi.tablets_per_blister,
        poi.generic_name, poi.form, poi.strength, poi.manufacturer, poi.location, poi.notes, poi.min_stock, poi.max_stock,
        COALESCE(poi.received_qty, 0) AS received_qty
       FROM purchase_order_items poi
       WHERE poi.po_id = ?`,
      [id]
    );

    // حساب الكمية المتبقية للطلب ككل
    const [[remainingResult]] = await pool.query(
      `SELECT
         SUM(GREATEST(poi.qty - COALESCE(poi.received_qty,0), 0)) AS remaining_qty
       FROM purchase_order_items poi
       WHERE poi.po_id = ?`,
      [id]
    );

    const remainingQuantity = Number(remainingResult?.remaining_qty || 0);

    // تحويل البيانات إلى التنسيق المطلوب للواجهة الأمامية
    const formattedPurchase = {
      id: purchase.id,
      supplier_id: purchase.supplier_id,
      supplier_name: purchase.supplier_name,
      status: purchase.status,
      total_amount: purchase.total,
      currency: purchase.currency,
      supplier_reference: purchase.supplier_reference,
      exchange_rate: purchase.exchange_rate,
      order_date: purchase.order_date,
      expected_date: purchase.expected_date,
      payment_terms: purchase.payment_terms,
      shipping_terms: purchase.shipping_terms,
      amount_received: purchase.amount_received,
      amount_remaining: purchase.amount_remaining,
      expiry_date: purchase.expiry_date,
      notes: purchase.notes,
      created_at: purchase.created_at,
      updated_at: purchase.updated_at,
      remaining_quantity: remainingQuantity, // إضافة الكمية المتبقية
      items: items.map(item => ({
        id: item.id,
        medicine_id: item.medicine_id,
        name: item.item_name,
        category: item.category,
        quantity: item.qty,
        received_qty: Number(item.received_qty || 0), // استخدام القيمة الفعلية من قاعدة البيانات
        price: item.unit_price,
        barcode: item.barcode,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        subtotal: item.line_total,
        unit: item.unit,
        packs_per_carton: item.packs_per_carton,
        blisters_per_pack: item.blisters_per_pack,
        tablets_per_blister: item.tablets_per_blister,
        wholesale_price: item.wholesale_price,
        retail_price: item.retail_price,
        carton_price: item.carton_price,
        blister_price: item.blister_price,
        tablet_price: item.tablet_price,
        supplier_item_code: item.supplier_item_code,
        generic_name: item.generic_name,
        form: item.form,
        strength: item.strength,
        manufacturer: item.manufacturer,
        location: item.location,
        notes: item.notes,
        min_stock: item.min_stock,
        max_stock: item.max_stock
      }))
    };

    res.json(formattedPurchase);
  } catch (e) {
    console.error("getPurchase error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function receivePurchase(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { items } = req.body;
    const pharmacy_id = req.user?.pharmacy_id;

    if (!pharmacy_id) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    if (!Array.isArray(items) || !items.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // ضمان وجود عمود received_qty لتتبع الاستلام الجزئي
    await connection.query(
      `ALTER TABLE purchase_order_items
         ADD COLUMN IF NOT EXISTS received_qty DECIMAL(12,3) DEFAULT 0`
    );

    // جلب أمر الشراء مع العناصر
    const [[purchase]] = await connection.query(
      `SELECT id, status, total FROM purchase_orders WHERE id = ? AND pharmacy_id = ?`,
      [id, pharmacy_id]
    );

    if (!purchase) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchase.status !== 'ordered') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase order is not in ordered status'
      });
    }

    // جلب عناصر أمر الشراء مع التفاصيل الأساسية
    const [purchaseItems] = await connection.query(
      `SELECT
        poi.id, poi.medicine_id, poi.qty, poi.unit_price, poi.line_total,
        poi.item_name, poi.supplier_item_code, poi.barcode, poi.batch_no,
        poi.expiry_date, poi.unit, poi.discount_percent, poi.discount_value,
        poi.free_qty, poi.is_bonus, poi.taxes, poi.extra_charges_share,
        poi.category, poi.wholesale_price, poi.retail_price, poi.carton_price,
        poi.blister_price, poi.tablet_price, poi.packs_per_carton,
        poi.blisters_per_pack, poi.tablets_per_blister,
        poi.generic_name, poi.form, poi.strength, poi.manufacturer, poi.location, poi.notes, poi.min_stock, poi.max_stock,
        COALESCE(poi.received_qty, 0) AS received_qty
       FROM purchase_order_items poi
       WHERE poi.po_id = ?`,
      [id]
    );

    // التحقق من أن الكميات المستلمة لا تتجاوز الكميات المطلوبة
    const normalizedItems = Array.isArray(items)
      ? items
          .map(it => ({
            purchase_item_id: Number(it.purchase_item_id),
            received_qty: Number(it.received_qty || 0),
            batch_no: it.batch_no || null,
            expiry_date: it.expiry_date || null,
          }))
          .filter(it => it.purchase_item_id && it.received_qty > 0)
      : [];

    if (!normalizedItems.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'لا توجد عناصر صالحة للاستلام'
      });
    }

    for (const receivedItem of normalizedItems) {
      const purchaseItem = purchaseItems.find(item => item.id === receivedItem.purchase_item_id);

      if (!purchaseItem) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Purchase item with ID ${receivedItem.purchase_item_id} not found`
        });
      }

      if (!purchaseItem.item_name) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Purchase item ${receivedItem.purchase_item_id} is missing name`
        });
      }

      const remainingQty = Number(purchaseItem.qty) - Number(purchaseItem.received_qty || 0);

      if (remainingQty <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `تم استلام العنصر ${purchaseItem.item_name} بالكامل مسبقاً`
        });
      }

      if (receivedItem.received_qty > remainingQty) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `الكمية المستلمة للعنصر ${purchaseItem.item_name} لا يمكن أن تتجاوز المتبقي (${remainingQty})`
        });
      }
    }

    // معالجة كل عنصر مستلم وتحديث المخزون
    for (const receivedItem of normalizedItems) {
      const purchaseItem = purchaseItems.find(item => item.id === receivedItem.purchase_item_id);
      if (!purchaseItem) continue;

      // التحقق من صحة البيانات
      if (!purchaseItem.item_name || receivedItem.received_qty <= 0) {
        continue; // تخطي العنصر بدلاً من إيقاف العملية
      }

      // البحث عن الدواء في جدول medicines
      const [[existingMedicine]] = await connection.query(
        `SELECT id, stock_qty, stock_base_qty, price, packs_per_carton, blisters_per_pack, tablets_per_blister
           FROM medicines
          WHERE pharmacy_id = ? AND (barcode = ? OR name = ?)
          LIMIT 1`,
        [pharmacy_id, purchaseItem.barcode || '', purchaseItem.item_name]
      );

      let medicineId;
      const unitType = normalizeUnit(purchaseItem.unit);
      const baseQtyChange = computeBaseQuantity(unitType, receivedItem.received_qty, purchaseItem);
      const unitDisplayLabel = unitLabel(unitType);

if (existingMedicine) {
  // تحديث كمية المخزون + الفئة + الأسعار للدواء الموجود
  medicineId = existingMedicine.id;
  const currentBaseStock = Number(existingMedicine.stock_base_qty ?? existingMedicine.stock_qty ?? 0);
  const nextBaseStock = currentBaseStock + baseQtyChange;

  await connection.query(
    `UPDATE medicines 
     SET 
        stock_qty = ?,
        stock_base_qty = ?,
        price = ?,
        batch_no = ?,
        expiry_date = ?,
        category = ?,
        retail_price = ?,
        carton_price = ?,
        blister_price = ?,
        tablet_price = ?,
        packs_per_carton = ?,
        blisters_per_pack = ?,
        tablets_per_blister = ?
     WHERE id = ?`,
    [
      nextBaseStock,
      nextBaseStock,
      purchaseItem.unit_price,
      receivedItem.batch_no || purchaseItem.batch_no || null,
      receivedItem.expiry_date || purchaseItem.expiry_date || null,
      purchaseItem.category,
      purchaseItem.retail_price,
      purchaseItem.carton_price,
      purchaseItem.blister_price,
      purchaseItem.tablet_price,
      purchaseItem.packs_per_carton,
      purchaseItem.blisters_per_pack,
      purchaseItem.tablets_per_blister,
      medicineId
    ]
  );

  await connection.query(
    `INSERT INTO inventory_movements (
        medicine_id,
        qty_change,
        reason,
        ref_type,
        ref_id,
        notes,
        pharmacy_id,
        unit_type,
        unit_label,
        unit_qty,
        base_qty_change,
        balance_after_base,
        ref_number
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      medicineId,
      baseQtyChange,
      "purchase",
      "purchase_order",
      id,
      null,
      pharmacy_id,
      unitType,
      unitDisplayLabel,
      Number(receivedItem.received_qty || 0),
      baseQtyChange,
      nextBaseStock,
      `PO-${id}`
    ]
  );
} else {
  // إنشاء دواء جديد مع الفئة والأسعار (مع معالجة تكرار الباركود)
  const initialBaseStock = baseQtyChange;
  try {
    const [result] = await connection.query(
      `INSERT INTO medicines (
          name, barcode, price, stock_qty, stock_base_qty, batch_no, expiry_date, pharmacy_id,
          category, retail_price, carton_price, blister_price, tablet_price,
          packs_per_carton, blisters_per_pack, tablets_per_blister
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purchaseItem.item_name,
        purchaseItem.barcode || null,
        purchaseItem.unit_price,
        initialBaseStock,
        initialBaseStock,
        receivedItem.batch_no || purchaseItem.batch_no || null,
        purchaseItem.expiry_date || receivedItem.expiry_date || null,
        pharmacy_id,
        purchaseItem.category,
        purchaseItem.retail_price,
        purchaseItem.carton_price,
        purchaseItem.blister_price,
        purchaseItem.tablet_price,
        purchaseItem.packs_per_carton,
        purchaseItem.blisters_per_pack,
        purchaseItem.tablets_per_blister
      ]
    );
    medicineId = result.insertId;

    await connection.query(
      `INSERT INTO inventory_movements (
          medicine_id,
          qty_change,
          reason,
          ref_type,
          ref_id,
          notes,
          pharmacy_id,
          unit_type,
          unit_label,
          unit_qty,
          base_qty_change,
          balance_after_base,
          ref_number
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        medicineId,
        baseQtyChange,
        "purchase",
        "purchase_order",
        id,
        null,
        pharmacy_id,
        unitType,
        unitDisplayLabel,
        Number(receivedItem.received_qty || 0),
        baseQtyChange,
        initialBaseStock,
        `PO-${id}`
      ]
    );
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY" && purchaseItem.barcode) {
      const [[duplicate]] = await connection.query(
        `SELECT id, stock_qty, stock_base_qty, pharmacy_id
           FROM medicines
          WHERE barcode = ?
          LIMIT 1`,
        [purchaseItem.barcode]
      );

      if (!duplicate) {
        throw error;
      }

      if (duplicate.pharmacy_id !== pharmacy_id) {
        throw new Error(`Barcode ${purchaseItem.barcode} مستخدم في صيدلية أخرى، يرجى استخدام باركود مختلف`);
      }

      medicineId = duplicate.id;
      const currentBaseStock = Number(duplicate.stock_base_qty ?? duplicate.stock_qty ?? 0);
      const nextBaseStock = currentBaseStock + baseQtyChange;

      await connection.query(
        `UPDATE medicines
            SET stock_qty = ?,
                stock_base_qty = ?,
                price = ?,
                batch_no = ?,
                expiry_date = ?,
                category = ?,
                retail_price = ?,
                carton_price = ?,
                blister_price = ?,
                tablet_price = ?,
                packs_per_carton = ?,
                blisters_per_pack = ?,
                tablets_per_blister = ?
          WHERE id = ?`,
        [
          nextBaseStock,
          nextBaseStock,
          purchaseItem.unit_price,
          receivedItem.batch_no || purchaseItem.batch_no || null,
          receivedItem.expiry_date || purchaseItem.expiry_date || null,
          purchaseItem.category,
          purchaseItem.retail_price,
          purchaseItem.carton_price,
          purchaseItem.blister_price,
          purchaseItem.tablet_price,
          purchaseItem.packs_per_carton,
          purchaseItem.blisters_per_pack,
          purchaseItem.tablets_per_blister,
          duplicate.id
        ]
      );

      await connection.query(
        `INSERT INTO inventory_movements (
            medicine_id,
            qty_change,
            reason,
            ref_type,
            ref_id,
            notes,
            pharmacy_id,
            unit_type,
            unit_label,
            unit_qty,
            base_qty_change,
            balance_after_base,
            ref_number
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          duplicate.id,
          baseQtyChange,
          "purchase",
          "purchase_order",
          id,
          null,
          pharmacy_id,
          unitType,
          unitDisplayLabel,
          Number(receivedItem.received_qty || 0),
          baseQtyChange,
          nextBaseStock,
          `PO-${id}`
        ]
      );
    } else {
      throw error;
    }
  }
}

      await connection.query(
        `UPDATE purchase_order_items
            SET received_qty = COALESCE(received_qty, 0) + ?,
                batch_no = COALESCE(?, batch_no),
                expiry_date = COALESCE(?, expiry_date)
          WHERE id = ?`,
        [
          receivedItem.received_qty,
          receivedItem.batch_no,
          receivedItem.expiry_date,
          receivedItem.purchase_item_id,
        ]
      );

      // إضافة حركة مخزون في جدول inventory_movements (مؤقتاً معطل لتجنب مشاكل foreign key)
      // await connection.query(
      //   `INSERT INTO inventory_movements (medicine_id, type, quantity, reference, pharmacist_id, pharmacy_id, batch_no, expiry_date, unit_cost, unit_price)
      //    VALUES (?, 'in', ?, ?, 1, ?, ?, ?, ?, ?)`,
      //   [
      //     medicineId,
      //     receivedItem.received_qty,
      //     `purchase_order:${id}`,
      //     pharmacy_id,
      //     receivedItem.batch_no || purchaseItem.batch_no,
      //     receivedItem.expiry_date || purchaseItem.expiry_date,
      //     purchaseItem.unit_price,
      //     purchaseItem.unit_price
      //   ]
      // );
    }

    // تحديث حالة أمر الشراء إلى received إذا تم استلام جميع العناصر
    const [[aggregate]] = await connection.query(
      `SELECT
         SUM(GREATEST(poi.qty - COALESCE(poi.received_qty,0), 0)) AS remaining
       FROM purchase_order_items poi
       WHERE poi.po_id = ?`,
      [id]
    );

    const remaining = Number(aggregate?.remaining || 0);
    const newStatus = remaining > 0 ? 'ordered' : 'received';

    await connection.query(
      `UPDATE purchase_orders SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: remaining > 0 ? 'تم استلام بعض العناصر' : 'تم استلام أمر الشراء بالكامل',
      purchase: {
        id: purchase.id,
        status: newStatus,
        received_items: normalizedItems.length,
        remaining_quantity: remaining,
      }
    });

  } catch (e) {
    await connection.rollback();
    console.error("receivePurchase error:", e);
    res.status(500).json({
      success: false,
      message: 'فشل في استلام أمر الشراء',
      error: e.message
    });
  } finally {
    connection.release();
  }
}
