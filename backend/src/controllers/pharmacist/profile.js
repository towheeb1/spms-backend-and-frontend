// backend/src/controllers/pharmacist/profile.js
import { pool } from "../../db.js";

export async function getProfile(req, res) {
  try {
    const id = req.user?.id;
    const pharmacy_id = req.user?.pharmacy_id;
    const [[ph]] = await pool.query(
      `SELECT p.id, p.full_name, p.email, p.username, p.phone, p.title, p.license_no, p.license_expiry, p.accreditation_body,
        p.timezone, p.locale, p.address_line1, p.address_line2, p.city, p.state, p.country, p.avatar_url,
        ph.id AS pharmacy_id, ph.name AS pharmacy_name, ph.display_name, ph.logo_url, ph.address_line1 AS ph_addr1,
        ph.address_line2 AS ph_addr2, ph.city AS ph_city, ph.state AS ph_state, ph.country AS ph_country,
        ph.timezone AS ph_timezone, ph.locale AS ph_locale, ph.branches_count, ph.branches
       FROM pharmacists p
       LEFT JOIN pharmacies ph ON ph.id = p.pharmacy_id
       WHERE p.id=? AND p.pharmacy_id=?
       LIMIT 1`,
      [id, pharmacy_id]
    );
    if (!ph) return res.status(404).json({ error: "Profile not found" });
    return res.json({ profile: ph });
  } catch (e) {
    console.error("getProfile error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const id = req.user?.id;
    const pharmacy_id = req.user?.pharmacy_id;
    const {
      full_name, phone, title, license_no, license_expiry, accreditation_body,
      address_line1, address_line2, city, state, country, timezone, locale,
      pharmacy_display_name, ph_address_line1, ph_address_line2, ph_city, ph_state, ph_country, ph_timezone, ph_locale, branches_count
    } = req.body || {};

    // update pharmacist
    await pool.query(
      `UPDATE pharmacists SET
         full_name=COALESCE(?, full_name), phone=COALESCE(?, phone), title=COALESCE(?, title),
         license_no=COALESCE(?, license_no), license_expiry=COALESCE(?, license_expiry), accreditation_body=COALESCE(?, accreditation_body),
         address_line1=COALESCE(?, address_line1), address_line2=COALESCE(?, address_line2), city=COALESCE(?, city), state=COALESCE(?, state), country=COALESCE(?, country),
         timezone=COALESCE(?, timezone), locale=COALESCE(?, locale)
       WHERE id=? AND pharmacy_id=?`,
      [full_name || null, phone || null, title || null, license_no || null, license_expiry || null, accreditation_body || null,
       address_line1 || null, address_line2 || null, city || null, state || null, country || null,
       timezone || null, locale || null, id, pharmacy_id]
    );

    // update pharmacy
    await pool.query(
      `UPDATE pharmacies SET
         display_name=COALESCE(?, display_name), address_line1=COALESCE(?, address_line1), address_line2=COALESCE(?, address_line2),
         city=COALESCE(?, city), state=COALESCE(?, state), country=COALESCE(?, country), timezone=COALESCE(?, timezone), locale=COALESCE(?, locale),
       branches_count=COALESCE(?, branches_count), branches=COALESCE(?, branches)
       WHERE id=?`,
      [pharmacy_display_name || null, ph_address_line1 || null, ph_address_line2 || null,
       ph_city || null, ph_state || null, ph_country || null, ph_timezone || null, ph_locale || null,
       Number.isFinite(Number(branches_count)) ? Number(branches_count) : null,
       branches ? JSON.stringify(branches) : null,
       pharmacy_id]
    );

    // audit record
    await pool.query(
      `INSERT INTO pharmacist_profile_audit (pharmacist_id, changed_fields, changed_by)
       VALUES (?,?,?)`,
      [id, JSON.stringify(req.body || {}), id]
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error("updateProfile error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
