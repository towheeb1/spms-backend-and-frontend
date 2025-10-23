// backend/src/routes/pharmacist.js
import express from "express";
import { dashboard, getProfile, updateProfile } from "../controllers/pharmacistController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/dashboard", requireAuth, dashboard);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

export default router;
