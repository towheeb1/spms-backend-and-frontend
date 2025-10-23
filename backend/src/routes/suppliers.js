// backend/src/routes/suppliers.js
import express from "express";
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../controllers/suppliersController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, listSuppliers);
router.post("/", requireAuth, createSupplier);
router.put("/:id", requireAuth, updateSupplier);
router.delete("/:id", requireAuth, deleteSupplier);

export default router;
