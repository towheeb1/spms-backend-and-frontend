// backend/src/routes/pos.js
import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  listCustomers,
  listPaymentMethods,
  listShifts,
  listSales,
  getSaleById,
  createSale,
  createDraftSale,
  addSalePayment,
} from "../controllers/posController.js";
import { getProfitReport, getSalesReport } from "../controllers/pos/reports.js";
import { returnSale } from "../controllers/pos/returns.js";

const router = express.Router();

router.use(requireAuth);

router.get("/customers", listCustomers);
router.get("/payment-methods", listPaymentMethods);
router.get("/shifts", listShifts);
router.get("/sales", listSales);
router.get("/sales/:id", getSaleById);
router.post("/sales", createSale);
router.post("/sales/drafts", createDraftSale);
router.post("/sales/:id/payments", addSalePayment);
router.post("/sales/:id/return", returnSale);

// تقارير المبيعات والأرباح
router.get("/reports/profit", getProfitReport);
router.get("/reports/sales", getSalesReport);

export default router;
