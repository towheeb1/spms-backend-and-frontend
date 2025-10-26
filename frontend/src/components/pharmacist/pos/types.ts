// src/types/pos.ts

import { ReactNode } from "react";

export interface Medicine {
  [x: string]: ReactNode;
  id?: number;
  name: string;
  generic_name?: string | null;
  form?: string | null;
  strength?: string | null;
  barcode?: string | null;
  price?: number;
  stock?: number;
  category?: string | null;
  category_id?: number;
  manufacturer?: string | null;
  batch_no?: string | null;
  expiry_date?: string | null;
  location?: string | null;
  notes?: string | null;
  min_stock?: number;
  max_stock?: number;
  is_active?: boolean;
  unit_id?: number;
  pharmacy_id?: number;
  created_at?: string;
  updated_at?: string;
  wholesale_price?: number | null;
  retail_price?: number | null;
  carton_price?: number | null;
  blister_price?: number | null;
  tablet_price?: number | null;
  packs_per_carton?: number | null;
  blisters_per_pack?: number | null;
  tablets_per_blister?: number | null;
}

export type SaleUnitType = "carton" | "pack" | "blister" | "tablet";

export interface CartItem {
  medicine_id: number;
  name: string;
  qty: number;
  unit_price: number;
  total: number;
  unit_type: SaleUnitType;
  unit_label: string;
  base_quantity: number; // عدد الحبات التي تمثلها الوحدة الواحدة
}

export interface Customer {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  tax_number?: string;
  is_active: boolean;
  created_at: string;
  pharmacy_id?: number;
  branch_id?: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  is_cash: boolean;
  is_active: boolean;
}

export interface POSRegister {
  id: number;
  name: string;
  branch_id: number;
  is_active: boolean;
  created_at: string;
  pharmacy_id?: number;
}

export interface POSShift {
  id: number;
  register_id: number;
  opened_by: number; // pharmacist.id
  closed_by?: number;
  opened_at: string;
  closed_at?: string;
  opening_float: number;
  expected_amount?: number;
  closing_amount?: number;
  notes?: string;
}

export interface POSInvoice {
  id: number;
  customer_name?: string;
  customer_id?: number;
  sale_date: string;
  total: number;
  notes?: string;
  status: "draft" | "posted" | "void" | "returned";
  branch_id?: number;
  register_id?: number;
  shift_id?: number;
  pharmacy_id?: number;
  created_at: string;
}

export interface POSReceipt {
  id: number;
  invoice: POSInvoice;
  items: POSReceiptItem[];
  payments: POSPayment[];
}

export interface POSReceiptItem {
  [x: string]: number | undefined;
  id: number;
  sale_id: number;
  medicine_id: number;
  qty: number;
  unit_price: number;
  line_total: number;
  medicine_name: string; // مثلاً من جدول `medicines`
  name?: string; // إضافة خاصية name كبديل
  unit_type?: SaleUnitType;
  unit_label?: string;
  base_quantity?: number;
}

export interface POSPayment {
  id: number;
  sale_id: number;
  method_id: number;
  amount: number;
  received_at: string;
  received_by: number; // pharmacist.id
  is_change: boolean;
  reference?: string;
  method_name: string; // مثلاً من جدول `payment_methods`
}