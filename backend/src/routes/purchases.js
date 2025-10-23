// backend/src/routes/purchases.js
import express from "express";
import { listPurchases, createPurchase, addPayment, getPurchase, receivePurchase } from "../controllers/purchasesController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, listPurchases);
router.get("/:id", requireAuth, getPurchase);
router.post("/", requireAuth, createPurchase);
router.post("/:id/receive", requireAuth, receivePurchase);
router.put("/:id/payment", requireAuth, addPayment);

export default router;
