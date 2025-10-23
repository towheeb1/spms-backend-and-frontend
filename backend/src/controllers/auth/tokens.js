// backend/src/controllers/auth/tokens.js
import { pool } from "../../db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

export async function me(req, res) {
  try {
    const access = req.cookies?.spms_access;
    if (!access) return res.status(401).json({ error: "Unauthorized" });
    try {
      const payload = jwt.verify(access, process.env.JWT_SECRET || "dev_secret");
      return res.json({ user: { id: payload.sub, role: payload.role } });
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (e) {
    console.error("me error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function refreshToken(req, res) {
  try {
    const raw = req.cookies?.spms_refresh;
    if (!raw) return res.status(401).json({ error: "No refresh" });
    const hash = sha256(raw);
    const [[row]] = await pool.query(
      `SELECT id, user_id, role, expires_at, revoked FROM auth_refresh_tokens
       WHERE token_hash=? LIMIT 1`,
      [hash]
    );
    if (!row || row.revoked || new Date(row.expires_at) <= new Date()) return res.status(401).json({ error: "Invalid refresh" });

    // rotate
    await pool.query(`UPDATE auth_refresh_tokens SET revoked=1 WHERE id=?`, [row.id]);
    // Fetch pharmacy_id for rotated token
    const [[pp]] = await pool.query(`SELECT pharmacy_id FROM pharmacists WHERE id=?`, [row.user_id]);
    const access = signAccess({ id: row.user_id, pharmacy_id: pp?.pharmacy_id || null });
    const rawRefresh = randomToken();
    await storeRefresh(row.user_id, row.role, rawRefresh, false);

  const cookieSecure = (process.env.NODE_ENV === 'production');
  const cookieOpts = { httpOnly: true, secure: cookieSecure, sameSite: "lax", path: "/" };
  res.cookie("spms_access", access, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie("spms_refresh", rawRefresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ ok: true });
  } catch (e) {
    console.error("refreshToken error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function logout(req, res) {
  try {
    const raw = req.cookies?.spms_refresh;
    if (raw) {
      await pool.query(`UPDATE auth_refresh_tokens SET revoked=1 WHERE token_hash=?`, [sha256(raw)]);
    }
  const cookieSecure = (process.env.NODE_ENV === 'production');
  const cookieOpts = { httpOnly: true, secure: cookieSecure, sameSite: "lax", path: "/" };
  res.clearCookie("spms_access", cookieOpts);
  res.clearCookie("spms_refresh", cookieOpts);
    return res.json({ ok: true });
  } catch (e) {
    console.error("logout error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
