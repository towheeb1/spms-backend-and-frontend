// backend/src/controllers/doctor/profile.js
import { pool } from "../../db.js";

function n(v) { const x = Number(v); return Number.isFinite(x) ? x : null; }
function cleanLicense(v) { return String(v || "").replace(/\D/g, "").slice(0, 9); }
function validLicense(v) { return /^(73|77|78|71|70)\d{7}$/.test(v); }
function toSetString(arr) {
  if (!Array.isArray(arr)) return null;
  const allow = new Set(["sat","sun","mon","tue","wed","thu","fri"]);
  const out = arr.filter((d) => allow.has(String(d)));
  return out.length ? out.join(",") : null;
}
function parseJSON(v) { try { return v ? JSON.parse(v) : null; } catch { return null; } }

export async function saveProfile(req, res) {
  try {
    const b = req.body || {};
    const full_name = String(b.full_name || "").trim();
    const doctor_number = cleanLicense(b.doctor_number);
    const clinic_name = String(b.clinic_name || "").trim();
    const clinic_address = String(b.clinic_address || "").trim();
    const avatar_url = b.avatar_url ? String(b.avatar_url) : null;

    if (!full_name || !doctor_number || !clinic_name || !clinic_address) {
      return res.status(400).json({ error: "حقول مفقودة: الاسم/الترخيص/العيادة/العنوان" });
    }
    if (!validLicense(doctor_number)) {
      return res.status(400).json({ error: "رقم الترخيص غير صحيح" });
    }

    const location_lat = b.location?.lat ?? null;
    const location_lng = b.location?.lng ?? null;

    const work_days = toSetString(b.work_schedule?.days);
    const work_start = b.work_schedule?.start || "08:00";
    const work_end   = b.work_schedule?.end   || "16:00";

    const specialties          = b.specialties ?? null;
    const custom_specialties   = b.custom_specialties ?? null;
    const preferred_pharmacies = b.preferred_pharmacies ?? null;
    const extra_pharmacies     = b.extra_pharmacies ?? null;

    const sql = `
      INSERT INTO doctorLogin (
        full_name, doctor_number, avatar_url,
        clinic_name, clinic_address,
        location_lat, location_lng,
        work_days, work_start, work_end,
        specialties, custom_specialties, preferred_pharmacies, extra_pharmacies
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        full_name=VALUES(full_name),
        avatar_url=VALUES(avatar_url),
        clinic_name=VALUES(clinic_name),
        clinic_address=VALUES(clinic_address),
        location_lat=VALUES(location_lat),
        location_lng=VALUES(location_lng),
        work_days=VALUES(work_days),
        work_start=VALUES(work_start),
        work_end=VALUES(work_end),
        specialties=VALUES(specialties),
        custom_specialties=VALUES(custom_specialties),
        preferred_pharmacies=VALUES(preferred_pharmacies),
        extra_pharmacies=VALUES(extra_pharmacies),
        updated_at=NOW()
    `;

    const params = [
      full_name, doctor_number, avatar_url,
      clinic_name, clinic_address,
      n(location_lat), n(location_lng),
      work_days, work_start, work_end,
      specialties ? JSON.stringify(specialties) : null,
      custom_specialties ? JSON.stringify(custom_specialties) : null,
      preferred_pharmacies ? JSON.stringify(preferred_pharmacies) : null,
      extra_pharmacies ? JSON.stringify(extra_pharmacies) : null,
    ];

    const [r] = await pool.query(sql, params);
    const [rows] = await pool.query(
      "SELECT idDoctor FROM doctorLogin WHERE doctor_number=? LIMIT 1",
      [doctor_number]
    );
    const id = rows?.[0]?.idDoctor || r.insertId || null;

    return res.json({ doctor_id: id });
  } catch (e) {
    console.error("saveProfile error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const license = cleanLicense(req.query?.doctor_number);
    if (!validLicense(license)) return res.status(400).json({ error: "رقم الترخيص غير صحيح" });

    const [rows] = await pool.query(
      `SELECT idDoctor, full_name, doctor_number, avatar_url,
              clinic_name, clinic_address, location_lat, location_lng,
              work_days, work_start, work_end,
              specialties, custom_specialties, preferred_pharmacies, extra_pharmacies,
              created_at, updated_at
       FROM doctorLogin WHERE doctor_number=? LIMIT 1`, [license]
    );
    if (!rows?.length) return res.status(404).json({ error: "الطبيب غير موجود" });

    const r = rows[0];
    const profile = {
      id: r.idDoctor,
      full_name: r.full_name,
      doctor_number: r.doctor_number,
      avatar_url: r.avatar_url,
      clinic_name: r.clinic_name,
      clinic_address: r.clinic_address,
      location: (r.location_lat != null && r.location_lng != null) ? { lat: Number(r.location_lat), lng: Number(r.location_lng) } : null,
      work_schedule: { days: r.work_days ? String(r.work_days).split(",") : [], start: r.work_start, end: r.work_end },
      specialties: parseJSON(r.specialties) || [],
      custom_specialties: parseJSON(r.custom_specialties) || [],
      preferred_pharmacies: parseJSON(r.preferred_pharmacies) || [],
      extra_pharmacies: parseJSON(r.extra_pharmacies) || [],
      created_at: r.created_at ? new Date(r.created_at).toISOString().slice(0,10) : r.created_at,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString().slice(0,10) : r.updated_at
    };
    return res.json({ profile });
  } catch (e) {
    console.error("getProfile error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
