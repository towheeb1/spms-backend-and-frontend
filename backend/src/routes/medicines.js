// backend/src/routes/medicines.js
import express from "express";
import { searchMedicines, listMedicines, listPurchaseOrderItems, createMedicine, updateMedicine, deleteMedicine, deleteManyMedicines } from "../controllers/medicinesController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();
router.get("/", requireAuth, listMedicines);
router.get("/search", requireAuth, searchMedicines);
router.get("/purchase-items", requireAuth, listPurchaseOrderItems);
router.post("/", requireAuth, createMedicine);
router.post("/bulk-delete", requireAuth, deleteManyMedicines);
router.put("/:id", requireAuth, updateMedicine);
router.delete("/:id", requireAuth, deleteMedicine);
export default router;
