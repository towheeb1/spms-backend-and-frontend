// backend/src/routes/geo.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Return distinct states and cities grouped by state from existing data
router.get("/locations", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT state, city FROM pharmacies WHERE (state IS NOT NULL AND state <> '') OR (city IS NOT NULL AND city <> '')`
    );
    const statesSet = new Set();
    const map = {};
    for (const r of rows) {
      const st = r.state || "";
      const ct = r.city || "";
      if (st) statesSet.add(st);
      if (st) {
        if (!map[st]) map[st] = new Set();
        if (ct) map[st].add(ct);
      }
    }
    const states = Array.from(statesSet).sort();
    const citiesByState = {};
    for (const st of Object.keys(map)) citiesByState[st] = Array.from(map[st]).sort();
    res.json({ states, citiesByState });
  } catch (e) {
    console.error("/geo/locations error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
