// backend/src/controllers/doctor/dashboard.js
import { pool } from "../../db.js";

async function tableExists(name) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [name]
  );
  return (rows?.[0]?.c || 0) > 0;
}

function monthLabelsBack(n = 6) {
  const out = []; const d = new Date(); d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function getDashboard(_req, res) {
  try {
    const hasPatients      = await tableExists("patients");
    const hasVisits        = await tableExists("visits");
    const hasPrescriptions = await tableExists("prescriptions");
    const hasMedicines     = await tableExists("medicines");

    let totalPatients = 0, patientsToday = 0, apptsToday = 0, rxToday = 0, expiring30 = 0;

    if (hasPatients) {
      const [r] = await pool.query("SELECT COUNT(*) c FROM patients");
      totalPatients = r?.[0]?.c || 0;
    }
    if (hasVisits) {
      const [r1] = await pool.query("SELECT COUNT(DISTINCT patient_id) c FROM visits WHERE DATE(visit_date)=CURDATE()");
      patientsToday = r1?.[0]?.c || 0;
      const [r2] = await pool.query("SELECT COUNT(*) c FROM visits WHERE DATE(visit_date)=CURDATE()");
      apptsToday = r2?.[0]?.c || 0;
    }
    if (hasPrescriptions) {
      const [r] = await pool.query("SELECT COUNT(*) c FROM prescriptions WHERE DATE(created_at)=CURDATE()");
      rxToday = r?.[0]?.c || 0;
    }
    if (hasMedicines) {
      const [r] = await pool.query("SELECT COUNT(*) c FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)");
      expiring30 = r?.[0]?.c || 0;
    }

    const kpis = [
      { label: "إجمالي المرضى", value: totalPatients },
      { label: "مرضى اليوم", value: patientsToday },
      { label: "مواعيد اليوم", value: apptsToday },
      { label: "وصفات اليوم", value: rxToday },
      { label: "انتهاء خلال 30يوم", value: expiring30 },
    ];

    let recentPatients = [];
    if (hasPatients) {
      const [rows] = await pool.query(
        "SELECT id AS id, full_name, avatar_url, gender, date_of_birth FROM patients ORDER BY id DESC LIMIT 8"
      );
      recentPatients = rows || [];
    }

    let recentRx = [];
    if (hasPrescriptions) {
      const [rows] = await pool.query(`
        SELECT p.prescription_id, pat.full_name, p.created_at
        FROM prescriptions p
        LEFT JOIN patients pat ON pat.id = p.patient_id
        ORDER BY p.prescription_id DESC LIMIT 8
      `);
      recentRx = rows || [];
    }

    const last6Labels = monthLabelsBack(6);
    let last6Map = Object.fromEntries(last6Labels.map(l => [l, 0]));
    if (hasVisits) {
      const [rows] = await pool.query(`
        SELECT DATE_FORMAT(visit_date, '%Y-%m') ym, COUNT(*) c
        FROM visits
        WHERE visit_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
        GROUP BY DATE_FORMAT(visit_date, '%Y-%m')
      `);
      for (const r of rows || []) last6Map[r.ym] = r.c;
    }
    const last6 = last6Labels.map(l => ({ label: l, value: last6Map[l] || 0 }));

    return res.json({
      kpis,
      recentPatients,
      recentRx,
      last6,
    });
  } catch (e) {
    console.error("getDashboard error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
