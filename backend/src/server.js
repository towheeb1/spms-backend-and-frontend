// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import { testConnection } from "./db.js";
import doctorRouter from "./routes/doctor.js";
import healthRoutes from "./routes/health.js";
import uploadRoutes from "./routes/upload.js";
import medicinesRoutes from "./routes/medicines.js";
import authRoutes from "./routes/auth.js";
import suppliersRoutes from "./routes/suppliers.js";
import inventoryRoutes from "./routes/inventory.js";
import pharmacistRoutes from "./routes/pharmacist.js";
import purchasesRoutes from "./routes/purchases.js";
import posRoutes from "./routes/pos.js";
import geoRoutes from "./routes/geo.js";
import { runMigrationsSequential } from "./utils/migrations.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// JSON
app.use(express.json());
// Cookies
app.use(cookieParser());

// Simple logger
app.use((req, _res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// Static uploads served from backend/uploads
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/upload", uploadRoutes);

// Health
app.use("/health", healthRoutes);
// Auth (OTP)
app.use("/auth", authRoutes);
// Geographic data
app.use("/geo", geoRoutes);
app.use("/api/geo", geoRoutes); // alias

// Routers
app.use("/doctor", doctorRouter);
app.use("/api/doctor", doctorRouter); // alias
app.use("/medicines", medicinesRoutes);
app.use("/api/medicines", medicinesRoutes); // alias
app.use("/suppliers", suppliersRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/purchases", purchasesRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/pharmacist", pharmacistRoutes);
app.use("/pos", posRoutes);
app.use("/api/pos", posRoutes);

// Welcome
app.get("/", (_req, res) => res.json({ message: "Welcome to Smart Pharmacy backend!" }));

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    expect: [
      "/doctor/profile",
      "/doctor/dashboard",
      "/upload/avatar",
      "/health/db",
    ],
  });
});

// Start after DB check
(async () => {
  try {
    console.log("✅ Starting server...");
    app.listen(PORT, () => console.log(`🟢 Backend listening on  : ${PORT}`));
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
    process.exit(1);
  }
})();

export default app;
