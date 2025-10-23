// frontend/src/services/sales.ts
import { api } from "./api";

export interface SalesReport {
  sales: Array<{
    id: number;
    sale_date: string;
    total: number;
    status: string;
    customer_id: number | null;
    customer_name: string | null;
    branch_name: string | null;
    items_count: number;
    total_items_qty: number;
  }>;
}

export interface ProfitReport {
  summary: {
    total_sales: number;
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    profit_margin: number;
    average_sale: number;
  };
  branches: Array<{
    branch_name: string;
    sales_count: number;
    revenue: number;
    cost: number;
    profit: number;
    profit_margin: number;
  }>;
  top_medicines: Array<{
    name: string;
    category: string | null;
    total_qty: number;
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    profit_margin: number;
  }>;
}

export interface CreateSalePayload {
  customer_id?: number | null;
  items: Array<{
    medicine_id: number;
    qty: number;
    unit_price: number;
    line_total: number;
  }>;
  notes?: string;
  branch_id?: number | null;
  register_id?: number | null;
  shift_id?: number | null;
}

export interface CreateDraftPayload {
  customer_id?: number | null;
  items: Array<{
    medicine_id: number;
    qty: number;
    unit_price: number;
    line_total: number;
  }>;
  notes?: string;
}

export interface AddPaymentPayload {
  method_id: number;
  amount: number;
  is_change?: boolean;
  reference?: string;
}

// إنشاء مبيعة جديدة
export const createSale = async (payload: CreateSalePayload) => {
  const { data } = await api.post("/sales", payload);
  return data;
};

// إنشاء مسودة مبيعة
export const createDraftSale = async (payload: CreateDraftPayload) => {
  const { data } = await api.post("/sales/drafts", payload);
  return data;
};

// إضافة دفعة لمبيعة
export const addSalePayment = async (saleId: number, payload: AddPaymentPayload) => {
  const { data } = await api.post(`/sales/${saleId}/payments`, payload);
  return data;
};

// جلب تفاصيل مبيعة
export const getSaleById = async (saleId: number) => {
  const { data } = await api.get(`/sales/${saleId}`);
  return data;
};

// جلب تقرير المبيعات
export const getSalesReport = async (params?: {
  from?: string;
  to?: string;
  branch_id?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.branch_id) query.append('branch_id', params.branch_id.toString());

  const { data } = await api.get(`/reports/sales?${query.toString()}`);
  return data as SalesReport;
};

// جلب تقرير الأرباح
export const getProfitReport = async (params?: {
  from?: string;
  to?: string;
  branch_id?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.branch_id) query.append('branch_id', params.branch_id.toString());

  const { data } = await api.get(`/reports/profit?${query.toString()}`);
  return data as ProfitReport;
};

// إنشاء مبيعة POS مع حساب الأرباح والخسائر (محاكاة محلية)
export const postSale = async (
  cartItems: Array<{
    medicine_id: number;
    name: string;
    qty: number;
    unit_price: number;
    total: number;
  }>,
  customerId: number | null,
  branchId?: number,
  registerId?: number,
  shiftId?: number
) => {
  try {
    // توليد رقم فاتورة تلقائي
    const invoiceId = Date.now();
    const total = cartItems.reduce((sum, item) => sum + item.total, 0);

    // حساب الأرباح والخسائر
    let totalCost = 0;
    let totalProfit = 0;

    cartItems.forEach(item => {
      // تكلفة افتراضية = 70% من سعر البيع
      const itemCost = item.unit_price * 0.7 * item.qty;
      const itemProfit = (item.unit_price - (item.unit_price * 0.7)) * item.qty;

      totalCost += itemCost;
      totalProfit += itemProfit;
    });

    // إنشاء الفاتورة
    const invoice: POSInvoice = {
      id: invoiceId,
      customer_id: customerId || undefined,
      sale_date: new Date().toISOString(),
      total: total,
      status: 'posted',
      branch_id: branchId,
      register_id: registerId,
      shift_id: shiftId,
      pharmacy_id: 1, // يجب أن يأتي من context
      created_at: new Date().toISOString(),
    };

    // حفظ في localStorage للمحاكاة المحلية
    const salesHistory = JSON.parse(localStorage.getItem('sales_history') || '[]');
    salesHistory.push({
      invoice,
      items: cartItems,
      profit: {
        totalCost,
        totalProfit,
        profitMargin: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0
      },
      created_at: new Date().toISOString()
    });
    localStorage.setItem('sales_history', JSON.stringify(salesHistory));

    return invoice;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

// الحصول على تاريخ المبيعات
export function getSalesHistory(): any[] {
  try {
    return JSON.parse(localStorage.getItem('sales_history') || '[]');
  } catch {
    return [];
  }
}

// حساب إجمالي الأرباح لليوم
export function calculateDailyProfit(date?: string): {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  transactionCount: number;
} {
  const history = getSalesHistory();
  const targetDate = date || new Date().toISOString().split('T')[0];

  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;

  history.forEach((sale: any) => {
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    if (saleDate === targetDate) {
      totalSales += sale.invoice.total;
      totalCost += sale.profit.totalCost;
      totalProfit += sale.profit.totalProfit;
    }
  });

  return {
    totalSales,
    totalCost,
    totalProfit,
    profitMargin: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
    transactionCount: history.filter((sale: any) =>
      new Date(sale.created_at).toISOString().split('T')[0] === targetDate
    ).length
  };
}

// حساب الأرباح للفترة المحددة
export function calculatePeriodProfit(startDate: string, endDate: string): {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  transactionCount: number;
} {
  const history = getSalesHistory();

  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;

  history.forEach((sale: any) => {
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    if (saleDate >= startDate && saleDate <= endDate) {
      totalSales += sale.invoice.total;
      totalCost += sale.profit.totalCost;
      totalProfit += sale.profit.totalProfit;
    }
  });

  return {
    totalSales,
    totalCost,
    totalProfit,
    profitMargin: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
    transactionCount: history.filter((sale: any) => {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    }).length
  };
}
