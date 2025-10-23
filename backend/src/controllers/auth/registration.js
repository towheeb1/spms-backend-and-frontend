// backend/src/controllers/auth/registration.js
import { pool } from "../../db.js";
import crypto from "crypto";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// Registration for Pharmacist accounts
export async function pharmacistRegister(req, res) {
  try {
    const { full_name, email, username, password,
      phone, title,
      license_no, license_expiry, accreditation_body,
      pharmacy_display_name,
      branches_count,
      address_line1, address_line2, city, state, country,
      timezone, locale,
    } = req.body || {};
    const name = String(full_name || "").trim();
    const em = email ? String(email).trim().toLowerCase() : null;
    const un = username ? String(username).trim().toLowerCase() : null;
    const pw = String(password || "");
    if (!name || !pw || (!em && !un)) return res.status(400).json({ error: "name and (email or username) and password required" });
    if (pw.length < 8) return res.status(400).json({ error: "weak password" });

    if (em) {
      const [[eexists]] = await pool.query(`SELECT id FROM pharmacists WHERE email=? LIMIT 1`, [em]);
      if (eexists) return res.status(409).json({ error: "email exists" });
    }
    if (un) {
      const [[uexists]] = await pool.query(`SELECT id FROM pharmacists WHERE username=? LIMIT 1`, [un]);
      if (uexists) return res.status(409).json({ error: "username exists" });
    }

  const hash = sha256(pw);
    // Create pharmacy for this pharmacist (ensure unique name)
    let baseName = pharmacy_display_name || `صيدلية ${name}`;
    let chosenName = baseName;
  for (let i = 0; i < 5; i++) {
      try {
        const [pr] = await pool.query(`INSERT INTO pharmacies (name, display_name, address_line1, address_line2, city, state, country, timezone, locale, branches_count, branches) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
          chosenName,
          pharmacy_display_name || null,
          address_line1 || null,
          address_line2 || null,
          city || null,
          state || null,
          country || null,
          timezone || null,
          locale || null,
          Number.isFinite(Number(branches_count)) && Number(branches_count) > 0 ? Number(branches_count) : 1,
          null
        ]);
        var pharmacyId = pr.insertId;
        break;
      } catch (err) {
        if (String(err?.code) === 'ER_DUP_ENTRY') {
          chosenName = `${baseName} - فرع ${Math.floor(Math.random()*90)+10}`;
          continue;
        }
        throw err;
      }
    }
    if (!pharmacyId) throw new Error('failed to create pharmacy');
    // Create pharmacist linked to pharmacy
    const [r] = await pool.query(
      `INSERT INTO pharmacists (full_name, email, username, phone, title, license_no, license_expiry, accreditation_body, password_hash, active, pharmacy_id, timezone, locale, address_line1, address_line2, city, state, country)
       VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,?,?)`,
      [name, em, un, phone || null, title || null, license_no || null, license_expiry || null, accreditation_body || null, hash, pharmacyId, timezone || null, locale || null, address_line1 || null, address_line2 || null, city || null, state || null, country || null]
    );
    // set owner if empty
    await pool.query(`UPDATE pharmacies SET owner_pharmacist_id=? WHERE id=? AND owner_pharmacist_id IS NULL`, [r.insertId, pharmacyId]);
    return res.json({ ok: true, id: r.insertId, pharmacy_id: pharmacyId });
  } catch (e) {
    console.error("pharmacistRegister error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
