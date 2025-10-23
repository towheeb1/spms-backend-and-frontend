// backend/src/routes/health.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
