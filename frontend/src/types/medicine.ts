// src/types/medicine.ts
// نوع موحد للأدوية (يستخدم في Medicines و Inventory)

export interface Medicine {
  // معرفات أساسية
  id?: number;
  
  // معلومات الدواء
  trade_name: string;
  generic_name?: string;
  price: number;
  barcode?: string;
  atc?: string;
  
  // الفئة والتصنيف
  category?: string;
  manufacturer?: string;
  dosage?: string;
  form?: string;
  strength?: string;
  
  // المخزون
  stock?: number;
  qty?: number; // alias لـ stock
  stock_qty?: number; // من الـ Backend
  min_stock?: number;
  max_stock?: number;
  
  // معلومات الدفعة
  batch_number?: string;
  expiry?: string;
  expiry_date?: string; // alias
  
  // التخزين
  location?: string;
  storage_location?: string; // alias
  
  // تواريخ النظام
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
}

// أنواع الفلاتر
export type MedicineSortBy = 'name' | 'price' | 'stock' | 'qty' | 'expiry';
export type MedicineStatusFilter = 'all' | 'good' | 'low_stock' | 'critical_stock' | 'near_expiry' | 'expired';

// DTO للإرسال إلى Backend
export interface MedicineCreateDTO {
  name: string;
  generic_name?: string;
  price: number;
  barcode?: string;
  category?: string;
  stock_qty?: number;
  expiry_date?: string;
  batch_no?: string;
  storage_location?: string;
  form?: string;
  strength?: string;
}

export interface MedicineUpdateDTO extends Partial<MedicineCreateDTO> {
  id: number;
}
