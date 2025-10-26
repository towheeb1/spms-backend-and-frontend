// src/components/inventory/types.ts

export interface Med {
  id?: number;
  trade_name: string;
  price: number;
  barcode?: string;
  qty?: number;
  expiry?: string;
  nearest_expiry?: string;
  category?: string;
  batch_number?: string;
  min_stock?: number;
  max_stock?: number;
  last_updated?: string;
  created_at?: string;
}

export type SortBy = 'name' | 'qty' | 'expiry' | 'price';
export type StatusFilter = 'all' | 'good' | 'low_stock' | 'critical_stock' | 'near_expiry' | 'expired';