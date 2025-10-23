// backend/src/controllers/auth/authentication.js
import { pool } from "../../db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// --- Password-based login (Pharmacist) ---
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function signAccess(user) {
  const payload = { sub: user.id, role: "Pharmacist", pharmacy_id: user.pharmacy_id };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "15m" });
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function storeRefresh(user_id, role, rawToken, rememberMe) {
  const token_hash = sha256(rawToken);
  const days = rememberMe ? 30 : 7;
  await pool.query(
    `INSERT INTO auth_refresh_tokens (user_id, role, token_hash, expires_at)
     VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [user_id, role, token_hash, days]
  );
  return rawToken;
}

export async function pharmacistLoginPassword(req, res) {
  try {
    const { emailOrUsername, password, rememberMe } = req.body || {};
    if (!emailOrUsername || !password) return res.status(400).json({ error: "email/username & password required" });

    // Rate-limit and lock checks
    const [[ph]] = await pool.query(
      `SELECT id, full_name, email, username, password_hash, active, failed_attempts,
              locked_until, pharmacy_id
       FROM pharmacists
       WHERE (email = ? OR username = ?)
       LIMIT 1`,
      [emailOrUsername, emailOrUsername]
    );
    if (!ph) return res.status(400).json({ error: "Invalid credentials" });
    if (ph.active === 0) return res.status(403).json({ error: "Account inactive" });
    if (ph.locked_until && new Date(ph.locked_until) > new Date()) {
      return res.status(429).json({ error: "Too many attempts" });
    }

    const ok = ph.password_hash && ph.password_hash === sha256(password);
    if (!ok) {
      const attempts = (ph.failed_attempts || 0) + 1;
      let lockSql = "";
      if (attempts >= 5) lockSql = ", locked_until = DATE_ADD(NOW(), INTERVAL 5 MINUTE), failed_attempts = 0";
      await pool.query(`UPDATE pharmacists SET failed_attempts = ? ${lockSql} WHERE id=?`, [attempts >= 5 ? 0 : attempts, ph.id]);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Reset attempts
    await pool.query(`UPDATE pharmacists SET failed_attempts=0, locked_until=NULL WHERE id=?`, [ph.id]);

    const access = signAccess({ id: ph.id, pharmacy_id: ph.pharmacy_id || null });
    const rawRefresh = randomToken();
    await storeRefresh(ph.id, "Pharmacist", rawRefresh, !!rememberMe);

    // In development (non-production) we must not set `secure: true` because
    // browsers will ignore cookies over plain HTTP when secure=true. Use
    // secure cookies only in production (HTTPS).
    const cookieSecure = (process.env.NODE_ENV === 'production');
    const cookieOpts = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
    };
    res.cookie("spms_access", access, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie("spms_refresh", rawRefresh, { ...cookieOpts, maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000 });

    return res.json({ user: { id: ph.id, role: "Pharmacist", name: ph.full_name }, next: "/pharmacist" });
  } catch (e) {
    console.error("pharmacistLoginPassword error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function pharmacistLogin(req, res) {
  try {
    const full_name = String(req.body?.full_name || req.body?.name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const avatar_url = req.body?.avatar_url ? String(req.body.avatar_url) : null;
    if (!full_name || !phone) return res.status(400).json({ error: "full_name/phone required" });

    // Upsert pharmacist by phone
    const [rows] = await pool.query(`SELECT id FROM pharmacists WHERE phone=? LIMIT 1`, [phone]);
    let id;
    if (rows?.length) {
      id = rows[0].id;
      await pool.query(`UPDATE pharmacists SET full_name=COALESCE(?, full_name), avatar_url=COALESCE(?, avatar_url) WHERE id=?`, [full_name, avatar_url, id]);
    } else {
      const [r] = await pool.query(
        `INSERT INTO pharmacists (full_name, phone, avatar_url) VALUES (?,?,?)`,
        [full_name, phone, avatar_url]
      );
      id = r.insertId;
    }

    const [[ph]] = await pool.query(
      `SELECT id, full_name, phone, avatar_url, pharmacy_name, pharmacy_addr FROM pharmacists WHERE id=?`,
      [id]
    );
    return res.json({ ok: true, pharmacist: ph });
  } catch (e) {
    console.error("pharmacistLogin error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
