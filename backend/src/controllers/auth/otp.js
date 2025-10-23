// backend/src/controllers/auth/otp.js
import { pool } from "../../db.js";

function genCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export async function sendOtp(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    if (!name || !phone) return res.status(400).json({ error: "name/phone required" });

    const code = genCode(6);
    await pool.query(
      "INSERT INTO otp_logs (phone, code, purpose) VALUES (?,?, 'login')",
      [phone, code]
    );

    // TODO: Integrate with SMS provider here
    console.log("OTP to", phone, "=", code);

    return res.json({ ok: true });
  } catch (e) {
    console.error("sendOtp error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const phone = String(req.body?.phone || "").trim();
    const code = String(req.body?.code || "").trim();
    if (!phone || !code) return res.status(400).json({ error: "phone/code required" });

    const [rows] = await pool.query(
      `SELECT id, phone, code, created_at
       FROM otp_logs
       WHERE phone=? AND code=? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
       ORDER BY id DESC
       LIMIT 1`,
      [phone, code]
    );
    if (!rows?.length) return res.status(400).json({ error: "Invalid or expired code" });

    return res.json({ ok: true });
  } catch (e) {
    console.error("verifyOtp error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
