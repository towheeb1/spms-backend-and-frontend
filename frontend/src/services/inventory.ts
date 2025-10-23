import { api } from "./api";

export type InventoryRow = {
  id: number;
  trade_name: string;
  category?: string | null;
  qty: number;
  price: number;
  min_stock?: number;
  last_updated?: string;
  nearest_expiry?: string | null;
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
};

export async function listInventory() {
  const { data } = await api.get<{ list: InventoryRow[] }>("/inventory");
  return data.list || [];
}

export async function stockIn(medicine_id: number, qty: number, note?: string) {
  const { data } = await api.post("/inventory/in", { medicine_id, qty, note });
  return data as { ok: boolean; stock_qty: number };
}

export async function stockOut(medicine_id: number, qty: number, note?: string) {
  const { data } = await api.post("/inventory/out", { medicine_id, qty, note });
  return data as { ok: boolean; stock_qty: number };
}

export async function deleteManyMedicines(ids: number[]) {
  const { data } = await api.post("/medicines/bulk-delete", { ids });
  return data as { ok: boolean; deleted: number };
}
