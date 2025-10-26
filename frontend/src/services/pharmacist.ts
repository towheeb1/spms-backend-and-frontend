import { api } from "./api";

export type DashboardChartPoint = { name: string; value: number };

export type DashboardStat = { label: string; value: number };

export type AnalyticsCard = {
  title: string;
  period: string;
  totalValue: number;
  chartData?: DashboardChartPoint[];
  stats?: DashboardStat[];
  count?: number;
};

export type DashboardAnalytics = {
  purchasePrices: AnalyticsCard;
  receipts: AnalyticsCard;
  payments: AnalyticsCard;
  returns: AnalyticsCard;
  profit: AnalyticsCard;
  purchaseOrder: AnalyticsCard;
};

export type PharmacistDashboard = {
  period: { key: string; label: string; from: string; to: string };
  filters: { branchId: number | null };
  kpis: {
    medicines: number;
    lowStock: number;
    suppliers: number;
    salesToday: number;
  };
  analytics: DashboardAnalytics;
  recentMovements: Array<{
    id: number;
    created_at: string;
    reason: string;
    qty_change: number;
    medicine_name: string;
  }>;
  topMedicines: Array<{
    id: number;
    name: string;
    stock_qty: number;
    price: number;
  }>;
};

export type Supplier = {
  id: number;
  name: string;
  code?: string; // New field from migration
  // Add other fields as needed
};

export type PurchaseItem = {
  id?: number;
  purchase_id: number;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  barcode?: string;
  batch_no?: string;
  expiry_date?: string;
  subtotal: number;
  branch?: string;
};

export type Purchase = {
  id?: number;
  supplier_id: number;
  currency?: string;
  supplier_reference?: string;
  exchange_rate?: number;
  order_date?: string;
  expected_date?: string;
  payment_terms?: string;
  credit_days?: number;
  down_payment?: number;
  installments_count?: number;
  installment_frequency?: string;
  first_due_date?: string;
  shipping_terms?: string;
  total_amount: number;
  amount_received?: number;
  amount_remaining?: number;
  expiry_date?: string;
  notes?: string;
  items?: PurchaseItem[];
};

export async function fetchSuppliers() {
  const { data } = await api.get<Supplier[]>('/suppliers');
  return data;
}

export async function fetchPharmacistDashboard(params?: { branchId?: number; period?: string; startDate?: string; endDate?: string }) {
  const query = new URLSearchParams();
  if (params?.branchId) query.set("branch_id", String(params.branchId));
  if (params?.period) query.set("period", params.period);
  if (params?.startDate) query.set("start_date", params.startDate);
  if (params?.endDate) query.set("end_date", params.endDate);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const { data } = await api.get<PharmacistDashboard>(`/pharmacist/dashboard${suffix}`);
  return data;
}
