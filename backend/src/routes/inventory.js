// backend/src/routes/inventory.js
import express from "express";
import { listMovements, stockIn, stockOut, listInventory } from "../controllers/inventoryController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

// Inventory list
router.get("/", requireAuth, listInventory);

// Movements feed (optional filter by ?medicine_id=)
router.get("/movements", requireAuth, listMovements);

// Stock in/out adjustments
router.post("/in", requireAuth, stockIn);
router.post("/out", requireAuth, stockOut);

export default router;
