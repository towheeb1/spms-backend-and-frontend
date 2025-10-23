// backend/src/routes/auth.js
import express from "express";
import { sendOtp, verifyOtp, pharmacistLogin, pharmacistLoginPassword, refreshToken, logout, me, pharmacistRegister } from "../controllers/authController.js";

const router = express.Router();

router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/pharmacist/login", pharmacistLogin);
router.post("/pharmacist/login-password", pharmacistLoginPassword);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", me);
router.post("/pharmacist/register", pharmacistRegister);

export default router;
