import { PurchaseItem } from "../types";

export type PurchaseItemWithBranch = PurchaseItem & { branch?: string | number };

export interface BranchOption {
  label: string;
  value: string;
}

export type PaymentTerm = "cash" | "credit" | "partial";

export type InstallmentFrequency = "weekly" | "monthly" | "quarterly";
