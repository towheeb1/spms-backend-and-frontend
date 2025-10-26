// backend/src/controllers/pos/returns.js
import { pool } from "../../db.js";
import { INVENTORY_MOVEMENT_REASONS } from "../../utils/constants/status.constants.js";

function normalizeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

export async function returnSale(req, res) {
  const saleId = normalizeNumber(req.params?.id);
  const pharmacyId = req.user?.pharmacy_id || null;
  const { items = [], note = null } = req.body || {};

  if (!pharmacyId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (!Number.isFinite(saleId) || saleId <= 0) {
    return res.status(400).json({ error: "Sale id is required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[sale]] = await connection.query(
      "SELECT id, pharmacy_id, status FROM sales WHERE id = ? AND pharmacy_id = ? FOR UPDATE",
      [saleId, pharmacyId]
    );

    if (!sale) {
      await connection.rollback();
      return res.status(404).json({ error: "Sale not found" });
    }

    if (sale.status === "returned") {
      await connection.rollback();
      return res.status(400).json({ error: "Sale already marked as returned" });
    }

    const [saleItems] = await connection.query(
      "SELECT id, medicine_id, qty, unit_price, line_total FROM sale_items WHERE sale_id = ?",
      [saleId]
    );

    if (!saleItems.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Sale has no items to return" });
    }

    const requestMap = new Map();
    if (Array.isArray(items) && items.length) {
      for (const entry of items) {
        const saleItemId = normalizeNumber(entry?.sale_item_id ?? entry?.id);
        const medicineId = normalizeNumber(entry?.medicine_id);
        const qty = normalizeNumber(entry?.qty ?? entry?.quantity);
        if (!Number.isFinite(qty) || qty <= 0) continue;

        if (Number.isFinite(saleItemId) && saleItemId > 0) {
          requestMap.set(`si-${saleItemId}`, {
            qty,
            note: entry?.note || null,
          });
        } else if (Number.isFinite(medicineId) && medicineId > 0) {
          requestMap.set(`m-${medicineId}`, {
            qty,
            note: entry?.note || null,
          });
        }
      }

      if (!requestMap.size) {
        await connection.rollback();
        return res.status(400).json({ error: "No valid return items provided" });
      }
    }

    const returnedItems = [];

    for (const saleItem of saleItems) {
      const saleItemId = saleItem.id;
      const medicineId = saleItem.medicine_id;
      const saleQty = Number(saleItem.qty || 0);

      let desiredQty;
      let itemNote = note || null;

      if (requestMap.size) {
        const bySaleItem = requestMap.get(`si-${saleItemId}`);
        const byMedicine = requestMap.get(`m-${medicineId}`);
        const requestEntry = bySaleItem || byMedicine || null;
        if (!requestEntry) continue;
        desiredQty = normalizeNumber(requestEntry.qty);
        if (!Number.isFinite(desiredQty) || desiredQty <= 0) continue;
        itemNote = requestEntry.note || note || null;
      } else {
        desiredQty = saleQty;
      }

      if (desiredQty > saleQty) {
        desiredQty = saleQty;
      }

      if (desiredQty <= 0) continue;

      const [[medicine]] = await connection.query(
        "SELECT id, stock_qty FROM medicines WHERE id = ? FOR UPDATE",
        [medicineId]
      );

      if (!medicine) {
        throw new Error(`Medicine ${medicineId} not found`);
      }

      const currentStock = Number(medicine.stock_qty || 0);
      const newStock = currentStock + desiredQty;

      await connection.query("UPDATE medicines SET stock_qty = ? WHERE id = ?", [newStock, medicineId]);

      await connection.query(
        `INSERT INTO inventory_movements (medicine_id, qty_change, reason, ref_type, ref_id, notes, pharmacy_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          medicineId,
          desiredQty,
          INVENTORY_MOVEMENT_REASONS.RETURN,
          "sale",
          saleId,
          itemNote || null,
          pharmacyId,
        ]
      );

      returnedItems.push({
        sale_item_id: saleItemId,
        medicine_id: medicineId,
        returned_qty: desiredQty,
        previous_stock: currentStock,
        new_stock: newStock,
      });
    }

    if (!returnedItems.length) {
      await connection.rollback();
      return res.status(400).json({ error: "No items were processed for return" });
    }

    await connection.query("UPDATE sales SET status = 'returned' WHERE id = ?", [saleId]);

    await connection.commit();

    res.json({
      ok: true,
      sale_id: saleId,
      new_status: "returned",
      returned_items: returnedItems,
    });
  } catch (error) {
    await connection.rollback();
    console.error("returnSale error:", error);
    res.status(400).json({ error: error.message || "Failed to process sale return" });
  } finally {
    connection.release();
  }
}
