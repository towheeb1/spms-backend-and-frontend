// backend/src/utils/validators/index.js
export { validateLoginCredentials, validateOtpRequest, validateOtpVerification, validatePharmacistRegistration } from "./auth.validator.js";
export { validateMedicineCreation, validateMedicineUpdate, validateMedicineSearch, validateStockAdjustment } from "./medicine.validator.js";
export { validatePurchaseCreation, validatePurchaseItem, validatePurchasePayment } from "./purchase.validator.js";
