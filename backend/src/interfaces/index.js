// backend/src/interfaces/index.js

// Export all types
export * from "./types/common.types.js";
export * from "./types/auth.types.js";
export * from "./types/medicine.types.js";
export * from "./types/purchase.types.js";
export * from "./types/sales.types.js";

// Export all contracts
export { default as IController } from "./contracts/i-controller.js";
export { default as IService } from "./contracts/i-service.js";
export { default as IRepository } from "./contracts/i-repository.js";
