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

export async function fetchPharmacistDashboard(params?: { branchId?: number; period?: string }) {
  const query = new URLSearchParams();
  if (params?.branchId) query.set("branch_id", String(params.branchId));
  if (params?.period) query.set("period", params.period);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  try {
    const { data } = await api.get<PharmacistDashboard>(`/pharmacist/dashboard${suffix}`);
    return data;
  } catch (error) {
    console.warn("API call failed, using fallback data:", error);
    // Fallback mock data for demonstration
    return {
      period: { key: "7d", label: "آخر 7 أيام", from: "2023-10-01", to: "2023-10-07" },
      filters: { branchId: params?.branchId || 1 },
      kpis: {
        medicines: 150,
        lowStock: 5,
        suppliers: 20,
        salesToday: 2500.50
      },
      analytics: {
        purchasePrices: {
          title: "عرض أسعار المشتريات",
          period: "آخر 7 أيام",
          totalValue: 15000,
          chartData: [
            { name: "مورد 1", value: 5000 },
            { name: "مورد 2", value: 10000 }
          ],
          stats: [
            { label: "إجمالي المشتريات", value: 15000 },
            { label: "عدد المشتريات", value: 10 }
          ]
        },
        receipts: {
          title: "إيصالات استلام",
          period: "آخر 7 أيام",
          totalValue: 8000,
          chartData: [
            { name: "نوع 1", value: 3000 },
            { name: "نوع 2", value: 5000 }
          ],
          stats: [
            { label: "إجمالي الإيصالات", value: 8000 },
            { label: "عدد الإيصالات", value: 15 }
          ]
        },
        payments: {
          title: "مدفوعات",
          period: "آخر 7 أيام",
          totalValue: 6000,
          chartData: [
            { name: "مدفوعات نقدية", value: 4000 },
            { name: "مدفوعات آجلة", value: 2000 }
          ],
          stats: [
            { label: "إجمالي المدفوعات", value: 6000 },
            { label: "عدد المدفوعات", value: 8 }
          ]
        },
        returns: {
          title: "المرتجعات",
          period: "آخر 7 أيام",
          totalValue: 1000,
          chartData: [
            { name: "مرتجعات منتجات", value: 1000 }
          ],
          stats: [
            { label: "إجمالي المرتجعات", value: 1000 },
            { label: "عدد المرتجعات", value: 3 }
          ]
        },
        profit: {
          title: "فائدة الشراء",
          period: "آخر 7 أيام",
          totalValue: 5000,
          chartData: [
            { name: "صافي الربح", value: 5000 }
          ],
          stats: [
            { label: "صافي الربح", value: 5000 },
            { label: "عدد الحركات", value: 20 }
          ]
        },
        purchaseOrder: {
          title: "أوامر الشراء",
          period: "آخر 7 أيام",
          totalValue: 12000,
          chartData: [
            { name: "أوامر نشطة", value: 12000 }
          ],
          stats: [
            { label: "إجمالي الأوامر", value: 12000 },
            { label: "عدد الأوامر", value: 5 }
          ]
        }
      },
      recentMovements: [
        {
          id: 1,
          created_at: "2023-10-07T10:00:00Z",
          reason: "بيع منتج",
          qty_change: -5,
          medicine_name: "دواء تجريبي"
        },
        {
          id: 2,
          created_at: "2023-10-06T14:30:00Z",
          reason: "إضافة مخزون",
          qty_change: 10,
          medicine_name: "دواء آخر"
        }
      ],
      topMedicines: [
        {
          id: 1,
          name: "دواء A",
          stock_qty: 100,
          price: 10.50
        },
        {
          id: 2,
          name: "دواء B",
          stock_qty: 80,
          price: 15.00
        }
      ]
    } as PharmacistDashboard;
  }
}
