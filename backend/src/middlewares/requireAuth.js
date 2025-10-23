// backend/src/middlewares/requireAuth.js
import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  try {
    const access = req.cookies?.spms_access;
    if (!access) return res.status(401).json({ error: "Unauthorized" });
    try {
      const payload = jwt.verify(access, process.env.JWT_SECRET || "dev_secret");
      req.user = { id: payload.sub, role: payload.role, pharmacy_id: payload.pharmacy_id || null };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (e) {
    console.error("requireAuth error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
