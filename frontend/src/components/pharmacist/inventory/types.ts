// src/components/inventory/types.ts

export interface Med {
  id?: number;
  trade_name: string;
  price: number;
  barcode?: string;
  atc?: string;
  qty?: number;
  expiry?: string;
  nearest_expiry?: string;
  category?: string;
  manufacturer?: string;
  batch_number?: string;
  location?: string;
  min_stock?: number;
  max_stock?: number;
  last_updated?: string;
  created_at?: string;
  base_qty?: number;
  last_receipt?: {
    unit_type?: string | null;
    unit_label?: string | null;
    unit_qty?: number;
    ref_number?: string | null;
    date?: string | null;
  } | null;
  items?: Array<{
    id?: number | string | null;
    item_name?: string | null;
    quantity?: number;
    unit?: string | null;
    unit_price?: number;
    expiry_date?: string | null;
    batch_no?: string | null;
    barcode?: string | null;
    order_date?: string | null;
    expected_date?: string | null;
    status?: string | null;
    supplier_name?: string | null;
  }>;
}

export type SortBy = 'name' | 'qty' | 'expiry' | 'price';
export type StatusFilter = 'all' | 'good' | 'low_stock' | 'critical_stock' | 'near_expiry' | 'expired';