// backend/src/routes/billing.js
import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import { getInvoiceDetails } from "../controllers/billingController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/invoices/:id", getInvoiceDetails);

export default router;
