// backend/src/controllers/purchases/list.js
import { pool } from "../../db.js";

export async function listPurchases(req, res) {
  try {
    const pharmacy_id = req.user?.pharmacy_id;
    if (!pharmacy_id) return res.status(403).json({ error: "Unauthorized" });

    const [purchaseRows] = await pool.query(
      `SELECT po.id,
              po.supplier_id,
              s.name AS supplier_name,
              s.code AS supplier_code,
              po.status,
              po.order_date,
              po.expected_date,
              po.total AS total_amount,
              po.currency,
              po.exchange_rate,
              po.payment_terms,
              po.shipping_terms,
              po.supplier_reference,
              po.amount_received,
              po.amount_remaining,
              po.expiry_date,
              po.notes,
              COALESCE(cnt.items_count, 0) AS items_count,
              COALESCE(cnt.total_qty, 0) AS total_quantity,
              COALESCE(cnt.nearest_expiry, po.expiry_date) AS nearest_expiry
       FROM purchase_orders po
       JOIN suppliers s ON s.id = po.supplier_id
       LEFT JOIN (
         SELECT poi.po_id,
                COUNT(*) AS items_count,
                SUM(poi.qty) AS total_qty,
                SUM(GREATEST(poi.qty - COALESCE(poi.received_qty,0),0)) AS remaining_qty,
                MIN(poi.expiry_date) AS nearest_expiry
         FROM purchase_order_items poi
         GROUP BY poi.po_id
       ) cnt ON cnt.po_id = po.id
       WHERE po.pharmacy_id = ?
       ORDER BY po.order_date DESC, po.id DESC
       LIMIT 200`,
      [pharmacy_id]
    );

    if (!purchaseRows.length) {
      return res.json({ list: [] });
    }

    const purchaseIds = purchaseRows.map((row) => row.id);

    let itemRows = [];
    if (purchaseIds.length) {
      const [rows] = await pool.query(
        `SELECT poi.po_id,
                poi.id,
                poi.item_name,
                poi.medicine_id,
                poi.qty,
                poi.unit,
                poi.unit_price,
                poi.line_total,
                poi.expiry_date,
                poi.batch_no,
                poi.barcode,
                COALESCE(poi.received_qty, 0) AS received_qty,
                poi.wholesale_price,
                poi.retail_price,
                poi.carton_price,
                poi.blister_price,
                poi.tablet_price,
                poi.packs_per_carton,
                poi.blisters_per_pack,
                poi.tablets_per_blister,
                poi.category,
                poi.generic_name,
                poi.form,
                poi.strength,
                poi.manufacturer,
                poi.location,
                poi.notes,
                poi.min_stock,
                poi.max_stock
         FROM purchase_order_items poi
         WHERE poi.po_id IN (?)
         ORDER BY poi.po_id, poi.id`,
        [purchaseIds]
      );
      itemRows = rows;
    }

    const itemMap = new Map();
    for (const row of itemRows) {
      if (!itemMap.has(row.po_id)) itemMap.set(row.po_id, []);
      itemMap.get(row.po_id).push({
        id: row.id,
        name: row.item_name,
        medicine_id: row.medicine_id,
        quantity: Number(row.qty || 0),
        received_qty: Number(row.received_qty || 0),
        unit: row.unit,
        unit_price: Number(row.unit_price || 0),
        line_total: Number(row.line_total || 0),
        expiry_date: row.expiry_date,
        batch_no: row.batch_no,
        barcode: row.barcode,
        wholesale_price: row.wholesale_price,
        retail_price: row.retail_price,
        carton_price: row.carton_price,
        blister_price: row.blister_price,
        tablet_price: row.tablet_price,
        packs_per_carton: row.packs_per_carton,
        blisters_per_pack: row.blisters_per_pack,
        tablets_per_blister: row.tablets_per_blister,
        category: row.category,
        generic_name: row.generic_name,
        form: row.form,
        strength: row.strength,
        manufacturer: row.manufacturer,
        location: row.location,
        notes: row.notes,
        min_stock: row.min_stock,
        max_stock: row.max_stock,
      });
    }

    const groupMap = new Map();

    for (const row of purchaseRows) {
      const supplierId = row.supplier_id;
      if (!groupMap.has(supplierId)) {
        groupMap.set(supplierId, {
          supplier_id: supplierId,
          supplier_name: row.supplier_name,
          supplier_code: row.supplier_code || null,
          orders_count: 0,
          total_spent: 0,
          total_received: 0,
          total_due: 0,
          purchases: [],
        });
      }

      const group = groupMap.get(supplierId);
      const totalAmount = Number(row.total_amount || 0);
      const amountReceived = Number(row.amount_received || 0);
      const amountRemaining = Number(row.amount_remaining || 0);

      group.orders_count += 1;
      group.total_spent += totalAmount;
      group.total_received += amountReceived;
      group.total_due += amountRemaining;

      group.purchases.push({
        id: row.id,
        supplier_id: supplierId,
        supplier_name: row.supplier_name,
        supplier_code: row.supplier_code || null,
        status: row.status,
        order_date: row.order_date,
        expected_date: row.expected_date,
        total_amount: totalAmount,
        currency: row.currency,
        exchange_rate: row.exchange_rate,
        payment_terms: row.payment_terms,
        shipping_terms: row.shipping_terms,
        supplier_reference: row.supplier_reference,
        amount_received: amountReceived,
        amount_remaining: amountRemaining,
        expiry_date: row.expiry_date,
        notes: row.notes,
        items_count: Number(row.items_count || 0),
        total_quantity: Number(row.total_quantity || 0),
        remaining_quantity: Number(row.remaining_qty || 0),
        nearest_expiry: row.nearest_expiry,
        items: itemMap.get(row.id) || [],
      });
    }

    const grouped = Array.from(groupMap.values()).map((group) => ({
      ...group,
      total_spent: Number(group.total_spent.toFixed(2)),
      total_received: Number(group.total_received.toFixed(2)),
      total_due: Number(group.total_due.toFixed(2)),
      purchases: group.purchases.sort((a, b) => {
        const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
        const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
        if (dateA === dateB) return Number(b.id) - Number(a.id);
        return dateB - dateA;
      }),
    }));

    grouped.sort((a, b) => b.total_spent - a.total_spent || a.supplier_name.localeCompare(b.supplier_name));

    res.json({ list: grouped });
  } catch (e) {
    console.error("listPurchases error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
