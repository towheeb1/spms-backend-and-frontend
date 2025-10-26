import { api } from "./api";

export type Supplier = {
  id?: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  tax_number?: string | null;
};

export interface PurchaseInvoiceResponse {
  id: number | string;
  supplier_name?: string | null;
  order_date?: string | null;
  status?: string | null;
  total_amount?: number | null;
  items?: Array<{
    name?: string | null;
    medicine_name?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
    line_total?: number | null;
  }>;
}

export async function listSuppliers(q?: string) {
  const { data } = await api.get("/suppliers", { params: q ? { q } : undefined });
  if (Array.isArray(data)) return data as Supplier[];
  if (Array.isArray(data?.items)) return data.items as Supplier[];
  if (Array.isArray(data?.list)) return data.list as Supplier[];
  const maybe = data && Object.values(data).find((v: any) => Array.isArray(v));
  if (Array.isArray(maybe)) return maybe as Supplier[];
  return [];
}

export const listPurchaseSummaries = async (): Promise<PurchaseInvoiceResponse[]> => {
  const { data } = await api.get(`/purchases`);
  if (Array.isArray(data)) {
    return data as PurchaseInvoiceResponse[];
  }
  if (Array.isArray((data as any)?.list)) {
    return (data as any).list as PurchaseInvoiceResponse[];
  }
  const maybeArray = data && Object.values(data).find((value) => Array.isArray(value)) as unknown;
  if (Array.isArray(maybeArray)) {
    return maybeArray as PurchaseInvoiceResponse[];
  }
  return [];
};

export const getPurchaseInvoiceById = async (purchaseId: number | string) => {
  const { data } = await api.get(`/purchases/${purchaseId}`);
  return data as PurchaseInvoiceResponse;
};

export async function createSupplier(payload: Supplier) {
  const { data } = await api.post("/suppliers", payload);
  return data as { id?: number };
}

export async function updateSupplier(id: number, payload: Partial<Supplier>) {
  const { data } = await api.put(`/suppliers/${id}`, payload);
  return data as { ok: true };
}

export async function deleteSupplier(id: number) {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data as { ok: true };
}

// أنواع البيانات لاستلام أمر الشراء
export interface ReceivePurchaseItem {
  purchase_item_id: number;
  received_qty: number;
  batch_no?: string;
  expiry_date?: string;
}

export interface ReceivePurchaseRequest {
  items: ReceivePurchaseItem[];
}

export interface ReceivePurchaseResponse {
  success: boolean;
  message: string;
  purchase?: {
    id: number;
    status: string;
    received_items: number;
  };
}

/**
 * استلام أمر شراء
 * @param purchaseOrderId - معرف أمر الشراء
 * @param items - عناصر الاستلام مع الكميات المستلمة
 * @returns Promise مع نتيجة العملية
 */
export async function receivePurchaseOrder(
  purchaseOrderId: number,
  items: ReceivePurchaseItem[]
): Promise<ReceivePurchaseResponse> {
  try {
    const { data } = await api.post(`/purchases/${purchaseOrderId}/receive`, { items });

    if (data.success) {
      return {
        success: true,
        message: data.message,
        purchase: data.purchase
      };
    } else {
      return {
        success: false,
        message: data.message || 'فشل في استلام أمر الشراء'
      };
    }
  } catch (error: any) {
    console.error('Error receiving purchase order:', error);

    // التعامل مع أخطاء الـ API
    if (error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message
      };
    }

    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء استلام أمر الشراء'
    };
  }
}
