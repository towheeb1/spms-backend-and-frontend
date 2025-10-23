// backend/src/routes/doctor.js
import express from "express";
import { saveProfile, getProfile, getDashboard } from "../controllers/doctorController.js";

const router = express.Router();

router.post("/profile", saveProfile);
router.get("/profile", getProfile);
router.get("/dashboard", getDashboard);

export default router;
