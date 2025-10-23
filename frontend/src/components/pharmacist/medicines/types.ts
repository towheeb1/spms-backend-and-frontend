// src/components/medicines/types.ts

export interface Med {
  id?: number;
  // prefer trade_name but allow name for backward compatibility
  trade_name?: string;
  name?: string;
  generic_name?: string | null;
  price?: number | null;
  barcode?: string | null;
  atc?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  dosage?: string | null;
  stock?: number | null;
  min_stock?: number | null;
  created_at?: string | null;
}