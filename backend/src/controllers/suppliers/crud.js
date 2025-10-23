// backend/src/controllers/suppliers/crud.js
import { pool } from "../../db.js";

export async function listSuppliers(req, res) {
  try {
    // التحقق من req.user
    if (!req.user) {
      console.error("listSuppliers error: req.user is undefined. Auth middleware may have failed.");
      return res.status(403).json({ error: "Unauthorized: User not authenticated" });
    }

    const pharmacy_id = req.user.pharmacy_id;

    if (!pharmacy_id) {
      console.error("listSuppliers error: pharmacy_id is missing in req.user.");
      return res.status(403).json({ error: "Unauthorized: Pharmacy ID not found" });
    }

    const q = String(req.query?.q || "").trim();
    let rows;

    if (q) {
      [rows] = await pool.query(
        `SELECT id, name, phone, email, address, tax_number, created_at, updated_at
         FROM suppliers
         WHERE pharmacy_id = ? AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)
         ORDER BY name ASC
         LIMIT 200`,
        [pharmacy_id, `%${q}%`, `%${q}%`, `%${q}%`]
      );
    } else {
      [rows] = await pool.query(
        `SELECT id, name, phone, email, address, tax_number, created_at, updated_at
         FROM suppliers
         WHERE pharmacy_id = ?
         ORDER BY name ASC
         LIMIT 200`,
        [pharmacy_id]
      );
    }

    const norm = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone || null,
      email: r.email || null,
      address: r.address || null,
      tax_number: r.tax_number || null,
      created_at: r.created_at && !isNaN(new Date(r.created_at).getTime()) ? new Date(r.created_at).toISOString().slice(0,10) : r.created_at,
      updated_at: r.updated_at && !isNaN(new Date(r.updated_at).getTime()) ? new Date(r.updated_at).toISOString().slice(0,10) : r.updated_at,
    }));

    res.json({ items: norm });
  } catch (e) {
    console.error("listSuppliers error:", e); // <-- هذا سيظهر الخطأ في سجلات الخادم
    res.status(500).json({ error: "Server error" });
  }
}

export async function createSupplier(req, res) {
  try {
    // التحقق من req.user
    if (!req.user) {
      console.error("createSupplier error: req.user is undefined. Auth middleware may have failed.");
      return res.status(403).json({ error: "Unauthorized: User not authenticated" });
    }

    const pharmacy_id = req.user.pharmacy_id;

    if (!pharmacy_id) {
      console.error("createSupplier error: pharmacy_id is missing in req.user.");
      return res.status(403).json({ error: "Unauthorized: Pharmacy ID not found" });
    }

    const { name, phone, email, address, tax_number } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });

    const [r] = await pool.query(
      `INSERT INTO suppliers (name, phone, email, address, tax_number, pharmacy_id) VALUES (?,?,?,?,?,?)`,
      [name, phone || null, email || null, address || null, tax_number || null, pharmacy_id]
    );

    res.json({ id: r.insertId });
  } catch (e) {
    console.error("createSupplier error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateSupplier(req, res) {
  try {
    // التحقق من req.user
    if (!req.user) {
      console.error("updateSupplier error: req.user is undefined. Auth middleware may have failed.");
      return res.status(403).json({ error: "Unauthorized: User not authenticated" });
    }

    const pharmacy_id = req.user.pharmacy_id;

    if (!pharmacy_id) {
      console.error("updateSupplier error: pharmacy_id is missing in req.user.");
      return res.status(403).json({ error: "Unauthorized: Pharmacy ID not found" });
    }

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const { name, phone, email, address, tax_number } = req.body || {};

    await pool.query(
      `UPDATE suppliers SET name=COALESCE(?, name), phone=COALESCE(?, phone), email=COALESCE(?, email), address=COALESCE(?, address), tax_number=COALESCE(?, tax_number) WHERE id=? AND pharmacy_id=?`,
      [name ?? null, phone ?? null, email ?? null, address ?? null, tax_number ?? null, id, pharmacy_id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("updateSupplier error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteSupplier(req, res) {
  try {
    // التحقق من req.user
    if (!req.user) {
      console.error("deleteSupplier error: req.user is undefined. Auth middleware may have failed.");
      return res.status(403).json({ error: "Unauthorized: User not authenticated" });
    }

    const pharmacy_id = req.user.pharmacy_id;

    if (!pharmacy_id) {
      console.error("deleteSupplier error: pharmacy_id is missing in req.user.");
      return res.status(403).json({ error: "Unauthorized: Pharmacy ID not found" });
    }

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    await pool.query(`DELETE FROM suppliers WHERE id=? AND pharmacy_id=?`, [id, pharmacy_id]);

    res.json({ ok: true });
  } catch (e) {
    console.error("deleteSupplier error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
