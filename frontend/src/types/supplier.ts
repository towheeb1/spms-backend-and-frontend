// src/types/supplier.ts
// أنواع موحدة للموردين والمشتريات

export interface Supplier {
  id: string | number;
  name: string;
  category?: string;
  phone: string;
  email: string;
  address?: string;
  tax_number?: string;
  status: 'active' | 'inactive';
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseItem {
  medicine_id?: number;
  name: string;
  quantity: number;
  qty?: number; // alias
  price: number;
  unit_price?: number; // alias
  line_total?: number;
}

export interface Purchase {
  id: string | number;
  supplier_id: string | number;
  supplier_name?: string;
  items: PurchaseItem[];
  items_count?: number;
  total_amount: number;
  total?: number; // alias
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'completed' | 'cancelled';
  order_date?: string;
  date: string; // ISO string
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseCreateDTO {
  supplier_id: string | number;
  items: PurchaseItem[];
  notes?: string;
  status?: Purchase['status'];
}
