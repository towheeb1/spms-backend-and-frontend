// src/pages/pharmacist/POS/POSPage.tsx
import React, { useState, useEffect } from "react";
import POSCart from "../../../components/pharmacist/pos/POSCart";
import POSMedicineSearch from "../../../components/pharmacist/pos/POSMedicineSearch";
import POSCustomerSelect from "../../../components/pharmacist/pos/POSCustomerSelect";
import POSActions from "../../../components/pharmacist/pos/POSActions";
import POSPaymentModal from "../../../components/pharmacist/pos/POSPaymentModal";
import POSReceiptModal from "../../../components/pharmacist/pos/POSReceiptModal";
import type { Medicine, CartItem, PaymentMethod, Customer, POSInvoice, POSReceiptItem, POSPayment } from "../../../components/pharmacist/pos/types";

interface Props {
  medicines: Medicine[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  onAddToCart: (medicine: Medicine) => void;
  onSaveDraft: (cart: CartItem[], customerId: number | null) => void;
  onPostSale: (cart: CartItem[], customerId: number | null) => Promise<{ invoice: POSInvoice; payments: POSPayment[] }>;
  onRecordPayment: (saleId: number, methodId: number, amount: number, isChange: boolean) => Promise<void>;
  onGetReceipt: (saleId: number) => Promise<{ invoice: POSInvoice; items: POSReceiptItem[]; payments: POSPayment[] }>;
}

export default function POSPage({
  medicines,
  customers,
  paymentMethods,
  onAddToCart,
  onSaveDraft,
  onPostSale,
  onRecordPayment,
  onGetReceipt,
}: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<{ invoice: POSInvoice; items: POSReceiptItem[]; payments: POSPayment[] } | null>(null);

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const handleSaveDraft = () => {
    onSaveDraft(cart, selectedCustomerId);
  };

  const handlePostSale = async () => {
    if (cart.length === 0) return;
    const result = await onPostSale(cart, selectedCustomerId);
    setCurrentReceipt({
      invoice: result.invoice,
      items: cart.map(item => ({
        id: 0, // temp id
        sale_id: result.invoice.id,
        medicine_id: item.medicine_id,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.total,
        medicine_name: item.name,
      })),
      payments: result.payments,
    });
    // فتح نافذة الدفع
    setShowPaymentModal(true);
  };

  const handlePayment = async (methodId: number, amount: number, isChange: boolean) => {
    // نفترض أن invoice.id هو saleId
    if (!currentReceipt) return;
    await onRecordPayment(currentReceipt.invoice.id, methodId, amount, isChange);
    // جلب الفاتورة المحدثة
    const receipt = await onGetReceipt(currentReceipt.invoice.id);
    setCurrentReceipt(receipt);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  const handleQtyChange = (medicineId: number, qty: number) => {
    setCart(prev =>
      prev.map(item =>
        item.medicine_id === medicineId
          ? { ...item, qty, total: qty * item.unit_price }
          : item
      )
    );
  };

  const handleDelete = (medicineId: number) => {
    setCart(prev => prev.filter(item => item.medicine_id !== medicineId));
  };

  function closeReceipt(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <POSCustomerSelect
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />
        <POSMedicineSearch
          medicines={medicines}
          onAddToCart={(med) => {
            onAddToCart(med);
            setCart(prev => {
              const existing = prev.find(item => item.medicine_id === med.id);
              if (existing) {
                return prev.map(item => item.medicine_id === med.id
                  ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.unit_price }
                  : item
                );
              } else {
                return [...prev, {
                  medicine_id: med.id,
                  name: med.name,
                  qty: 1,
                  unit_price: med.price,
                  total: med.price,
                }];
              }
            });
          } } onSearch={function (query: string): Promise<void> {
            throw new Error("Function not implemented.");
          } }        />
        <POSCart
          cart={cart}
          onQtyChange={handleQtyChange}
          onDelete={handleDelete}
          total={total}
        />
      </div>

      <div className="space-y-4">
        <POSActions
          cart={cart}
          onSaveDraft={handleSaveDraft}
          onPostSale={handlePostSale}
          disabled={cart.length === 0}
        />
      </div>

      {showPaymentModal && (
        <POSPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={total}
          paymentMethods={paymentMethods}
          onPayment={handlePayment}
        />
      )}

      {showReceiptModal && currentReceipt && (
        <POSReceiptModal
          isOpen={showReceiptModal}
          onClose={closeReceipt}
          invoice={currentReceipt.invoice}
          items={currentReceipt.items}
          payments={currentReceipt.payments}
        />
      )}
    </div>
  );
}