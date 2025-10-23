// test-controllers.js - اختبار بسيط للتأكد من أن الاستيرادات تعمل
import { me, refreshToken, logout } from "./backend/src/controllers/auth/index.js";
import { searchMedicines, listMedicines, createMedicine, updateMedicine, deleteMedicine, deleteManyMedicines } from "./backend/src/controllers/medicines/index.js";
import { listMovements, stockIn, stockOut, listInventory } from "./backend/src/controllers/inventory/index.js";
import { dashboard, getProfile, updateProfile } from "./backend/src/controllers/pharmacist/index.js";
import { listCustomers, listPaymentMethods, listShifts, listSales, getSaleById, createSale, createDraftSale, addSalePayment } from "./backend/src/controllers/pos/index.js";
import { listPurchases, createPurchase, addPayment } from "./backend/src/controllers/purchases/index.js";
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from "./backend/src/controllers/suppliers/index.js";

console.log("✅ جميع الاستيرادات تعمل بشكل صحيح!");
console.log("✅ تم تقسيم الـ controllers بنجاح دون تخريب البنية!");
