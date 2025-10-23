import { api } from "./api";

export type Medicine = {
  id?: number;
  name: string;
  generic_name?: string | null;
  form?: string | null;
  strength?: string | null;
  barcode?: string | null;
  price?: number;
  stock?: number;
  category?: string | null;
  manufacturer?: string | null;
  batch_no?: string | null;
  expiry_date?: string | null;
  location?: string | null;
  notes?: string | null;
  min_stock?: number;
  max_stock?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // حقول إضافية من purchase_order_items
  po_id?: number;
  medicine_id?: number;
  qty?: number;
  unit_price?: number;
  line_total?: number;
  wholesale_price?: number;
  retail_price?: number;
  carton_price?: number;
  blister_price?: number;
  tablet_price?: number;
  packs_per_carton?: number;
  blisters_per_pack?: number;
  tablets_per_blister?: number;
  supplier_id?: number;
  po_status?: string;
  order_date?: string;
};

export async function listMedicines() {
  try {
    const { data } = await api.get("/medicines");
    // Support multiple server shapes: { items: [...] } or { list: [...] } or direct array
    if (Array.isArray(data)) return data as Medicine[];
    if (Array.isArray(data?.items)) return data.items as Medicine[];
    if (Array.isArray(data?.list)) return data.list as Medicine[];
    // Unexpected shape - attempt to find an array in response
    const maybe = data && Object.values(data).find((v: any) => Array.isArray(v));
    if (Array.isArray(maybe)) return maybe as Medicine[];
    console.warn('listMedicines: unexpected response shape', data);
    return [];
  } catch (err) {
    // propagate error so caller can react (401 -> redirect to login, etc.)
    throw err;
  }
}

export async function listPurchaseOrderItems() {
  try {
    const { data } = await api.get("/medicines/purchase-items");
    // Support multiple server shapes: { items: [...] } or { list: [...] } or direct array
    if (Array.isArray(data)) return data as Medicine[];
    if (Array.isArray(data?.items)) return data.items as Medicine[];
    if (Array.isArray(data?.list)) return data.list as Medicine[];
    // Unexpected shape - attempt to find an array in response
    const maybe = data && Object.values(data).find((v: any) => Array.isArray(v));
    if (Array.isArray(maybe)) return maybe as Medicine[];
    console.warn('listPurchaseOrderItems: unexpected response shape', data);
    return [];
  } catch (err) {
    // propagate error so caller can react (401 -> redirect to login, etc.)
    throw err;
  }
}

export async function createMedicine(payload: Medicine) {
  const { data } = await api.post("/medicines", payload);
  return data as { id: number };
}

export async function updateMedicine(id: number, payload: Partial<Medicine>) {
  const { data } = await api.put(`/medicines/${id}`, payload);
  return data as { ok: true };
}

export async function deleteMedicine(id: number) {
  const { data } = await api.delete(`/medicines/${id}`);
  return data as { ok: true };
}
