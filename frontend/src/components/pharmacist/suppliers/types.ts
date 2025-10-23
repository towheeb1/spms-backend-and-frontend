// src/components/suppliers/types.ts

export interface Supplier {
  id: string | number;
  name: string;
  code?: string; // internal supplier code
  category: string;
  phone: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive';
  products_count?: number;
  orders_count?: number;
  total_purchased_quantity?: number;
  total_spent?: number;
  total_paid?: number;
  total_due?: number;
}

export interface PurchaseItem {
  id?: string | number;
  name?: string | null;
  category?: string | null;
  internal_item_code?: string;
  supplier_item_code?: string;
  quantity: number;
  price?: number;
  unit_price?: number;
  line_total?: number;
  wholesale_price?: number;
  retail_price?: number;
  carton_price?: number;
  packs_per_carton?: number;
  blisters_per_pack?: number;
  tablets_per_blister?: number;
  blister_price?: number;
  tablet_price?: number;
  unit?: string | null;
  barcode?: string | null;
  batch_no?: string | null;
  expiry_date?: string | null;
  subtotal?: number;
  moq?: number;
  discount_percent?: number;
  discount_value?: number;
  free_quantity?: number;
  taxes?: { name: string; percent: number }[] | string | null;
  extra_charges_share?: number;
  is_bonus?: boolean;
  medicine_id?: string | number | null;
}

export interface Purchase {
  id: string | number;
  supplier_id: string | number;
  supplier_name: string;
  supplier_code?: string | null;
  status: string;
  order_date?: string | null;
  expected_date?: string | null;
  total_amount: number;
  currency?: string | null;
  exchange_rate?: number | null;
  payment_terms?: string | null;
  shipping_terms?: string | null;
  supplier_reference?: string | null;
  amount_received?: number;
  amount_remaining?: number;
  expiry_date?: string | null;
  notes?: string | null;
  items_count?: number;
  items?: PurchaseItem[];
  total_quantity?: number;
  remaining_quantity?: number; // إضافة حقل الكمية المتبقية
  nearest_expiry?: string | null;
}

export interface SupplierPurchaseGroup {
  status: string;
  remaining_quantity: number;
  supplier_id: string | number;
  supplier_name: string;
  supplier_code?: string | null;
  orders_count: number;
  total_spent: number;
  total_received: number;
  total_due: number;
  purchases: Purchase[];
}

export interface InventoryItem {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  supplier_id?: string | number;
  supplier_name?: string;
  last_updated: string; // ISO string
}

export interface SupplierPurchaseSummary {
  id: number | string;
  order_date: string | null;
  expected_date: string | null;
  status: string;
  total_amount: number;
  amount_received: number;
  amount_remaining: number;
  payment_terms?: string | null;
  items_count: number;
  total_quantity: number;
  nearest_expiry: string | null;
  items: Array<{
    name: string | null;
    medicine_name: string | null;
    quantity: number;
    unit: string | null;
    unit_price: number;
    line_total: number;
    expiry_date: string | null;
  }>;
}

export interface SupplierStats {
  orders_count: number;
  total_spent: number;
  total_paid: number;
  total_due: number;
}

export interface SupplierDetailsPayload {
  supplier: {
    id: number | string;
    name: string;
    category?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    tax_number?: string | null;
    status?: string | null;
    created_at?: string | null;
  };
  stats: SupplierStats;
  purchases: SupplierPurchaseSummary[];
}