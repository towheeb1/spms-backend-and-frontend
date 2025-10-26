// src/pages/pharmacist/POS/POS.tsx
import React, { useState, useEffect, useRef } from "react";
import { api } from "../../../services/api";
import { useToast } from "../../../components/ui/Toast";
import type { Customer, PaymentMethod, POSInvoice, POSPayment, POSReceipt, CartItem } from "../../../components/pharmacist/pos/types";
import POSPage from "../../../components/pharmacist/pos/POSPage";

export default function POS() {
  const toast = useToast();
  const showLoadError = toast.error;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const errorShownRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customersRes, paymentsRes] = await Promise.all([
          api.get("/pos/customers"),
          api.get("/pos/payment-methods"),
        ]);

        setCustomers(customersRes.data?.list || customersRes.data || []);

        const resolvedPayments: PaymentMethod[] = paymentsRes.data?.list || paymentsRes.data || [];
        if (resolvedPayments.length > 0) {
          setPaymentMethods(resolvedPayments);
        } else {
          setPaymentMethods([
            { id: -1, name: "نقدي", is_cash: true, is_active: true },
            { id: -2, name: "بطاقة", is_cash: false, is_active: true },
            { id: -3, name: "تحويل بنكي", is_cash: false, is_active: true },
          ]);
        }
        errorShownRef.current = false;
      } catch (error: any) {
        console.error('Error loading POS data:', error);
        if (!errorShownRef.current) {
          showLoadError('فشل في تحميل بيانات نقطة البيع');
          errorShownRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showLoadError]);

  const handleSaveDraft = async (cart: CartItem[], customerId: number | null) => {
    try {
      await api.post("/pos/sales/drafts", {
        customer_id: customerId,
        items: cart,
      });
      toast.success('تم حفظ المسودة بنجاح');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error('فشل في حفظ المسودة');
    }
  };

  const handlePostSale = async (cart: CartItem[], customerId: number | null): Promise<{ invoice: POSInvoice; payments: POSPayment[] }> => {
    const payload = {
      customer_id: customerId,
      items: cart.map((item) => ({
        medicine_id: item.medicine_id,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.total,
      })),
    };
    const { data } = await api.post("/pos/sales", payload);
    return data;
  };

  const handleRecordPayment = async (saleId: number, methodId: number, amount: number, isChange: boolean) => {
    await api.post(`/pos/sales/${saleId}/payments`, {
      method_id: methodId,
      amount,
      is_change: isChange,
    });
  };

  const handleGetReceipt = async (saleId: number): Promise<POSReceipt> => {
    const { data } = await api.get(`/pos/sales/${saleId}`);
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <POSPage
      customers={customers}
      paymentMethods={paymentMethods}
      onSaveDraft={handleSaveDraft}
       onRecordPayment={handleRecordPayment}
      onGetReceipt={handleGetReceipt}
    />
  );
}