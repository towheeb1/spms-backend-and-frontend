// backend/src/controllers/medicines/crud.js
import { pool } from "../../db.js";

// دوال CRUD للأدوية (سيتم تطويرها لاحقاً)
export async function createMedicine(req, res) {
  try {
    // منطق إنشاء دواء جديد
    res.status(501).json({ error: "Not implemented yet" });
  } catch (e) {
    console.error("createMedicine error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateMedicine(req, res) {
  try {
    // منطق تحديث دواء موجود
    res.status(501).json({ error: "Not implemented yet" });
  } catch (e) {
    console.error("updateMedicine error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteMedicine(req, res) {
  try {
    // منطق حذف دواء
    res.status(501).json({ error: "Not implemented yet" });
  } catch (e) {
    console.error("deleteMedicine error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteManyMedicines(req, res) {
  try {
    // منطق حذف عدة أدوية
    res.status(501).json({ error: "Not implemented yet" });
  } catch (e) {
    console.error("deleteManyMedicines error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
