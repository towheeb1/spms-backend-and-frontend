// src/components/suppliers/PurchasesTab.tsx
import { useMemo, useState } from "react";
import { api } from "../../../services/api";
import { useToast } from "../../ui/Toast";
import { SupplierPurchaseGroup } from "./types";
import SupplierCard from "./suppliers-com/SupplierCard";
import SupplierDetailsModal from "./suppliers-com/SupplierDetailsModal";
import ReceivePurchaseModal from "../purchases/ReceivePurchaseModal";
import './style/PurchasesTab.css';
 
interface Props {
  purchases: SupplierPurchaseGroup[];
  onAdd: () => void;
  onDataChange?: () => void;
}

export default function PurchasesTab({ purchases, onAdd, onDataChange }: Props) {
  const toast = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPurchaseGroup | null>(null);
  const [selectedPurchaseForReceive, setSelectedPurchaseForReceive] = useState<any>(null);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);

  const supplierTotals = useMemo(() => {
    return purchases.map((group) => {
      const baseCurrency = group.purchases[0]?.currency || "YER";
      const totalItems = group.purchases.reduce((sum, order) => sum + Number(order.items_count || order.items?.length || 0), 0);
      const totalQuantity = group.purchases.reduce((sum, order) => sum + Number(order.total_quantity || 0), 0);
      return {
        ...group,
        totalItems,
        totalQuantity,
        baseCurrency,
      };
    });
  }, [purchases]);

  const handlePayment = async (id: number, amount: number) => {
    try {
      await api.put(`/purchases/${id}/payment`, { amount });
      toast.success('تم إضافة الدفعة بنجاح', 'دفعة مسجلة');
      onDataChange?.();
    } catch (error: any) {
      console.error("Payment error:", error);

      // رسائل خطأ احترافية للدفعات
      if (error.response?.status === 400) {
        toast.error('البيانات المدخلة غير صحيحة', 'خطأ في البيانات');
        
       } else if (error.response?.status === 404) {
        toast.error('لم يتم العثور على أمر الشراء', 'خطأ في البيانات');
      } else if (error.response?.status >= 500) {
        toast.error('حدث خطأ في الخادم أثناء حفظ الدفعة', 'خطأ في الخادم');
      } else {
        toast.error('فشل في إضافة الدفعة', 'خطأ في العملية');
      }
    }
  };

  const handleReceivePurchase = async (purchase: any) => {
    try {
      // جلب تفاصيل أمر الشراء مع العناصر
      const { data } = await api.get(`/purchases/${purchase.id}`);
      setSelectedPurchaseForReceive(data);
      setPurchaseItems(data.items || []);
    } catch (error: any) {
      console.error('Error fetching purchase details:', error);

      // رسائل خطأ احترافية باستخدام toast
      if (error.response?.status === 404) {
        toast.error('لم يتم العثور على أمر الشراء المطلوب', 'خطأ في البيانات');
      } else if (error.response?.status === 403) {
        toast.error('ليس لديك صلاحية للوصول إلى هذا أمر الشراء', 'خطأ في الصلاحيات');
      } else if (error.response?.status >= 500) {
        toast.error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً', 'خطأ في الخادم');
      } else {
        toast.error('فشل في جلب تفاصيل أمر الشراء', 'خطأ في الاتصال');
      }
    }
  };

  const handleReceiveSuccess = async () => {
    setSelectedPurchaseForReceive(null);
    setPurchaseItems([]);

    // انتظار قصير للتأكد من أن التحديثات في قاعدة البيانات اكتملت
    await new Promise(resolve => setTimeout(resolve, 500));

    // إعادة تحميل البيانات فوراً بعد الاستلام
    try {
      await onDataChange?.();
    } catch (error) {
      console.error('Error refreshing data after receive:', error);
    }
  };

  const closeModal = () => setSelectedSupplier(null);

  return (
    <div className="purchases-tab-container">
      <div className="purchases-tab-header">
        <h2 className="purchases-tab-title">أوامر الشراء</h2>
        <button
          className="purchases-tab-add-button"
          onClick={onAdd}
        >
          <span>🛒</span> أمر شراء جديد
        </button>
      </div>

      {supplierTotals.length > 0 ? (
        <div className="purchases-tab-cards-grid">
          {supplierTotals.map((group) => (
            <SupplierCard
              key={group.supplier_id}
              group={group}
              onViewDetails={setSelectedSupplier}
            />
          ))}
        </div>
      ) : (
        <div className="purchases-tab-empty-state">
          <div className="purchases-tab-empty-icon">🛒</div>
          <h3 className="purchases-tab-empty-title">لا توجد أوامر شراء</h3>
          {purchases.length > 0 && purchases[0].status === 'ordered' && purchases[0].remaining_quantity > 0 && onAdd && (
            <button
              type="button"
              className="purchases-tab-empty-small-button"
              onClick={onAdd}
            >
              إنشاء أمر شراء
            </button>
          )}
          <p className="purchases-tab-empty-description">ابدأ بإنشاء أمر شراء جديد</p>
          <button
            className="purchases-tab-empty-button"
            onClick={onAdd}
          >
            إنشاء أمر شراء
          </button>
        </div>
      )}

      {selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={closeModal}
          onPayment={handlePayment}
          onReceive={handleReceivePurchase}
        />
      )}

      {selectedPurchaseForReceive && (
        <ReceivePurchaseModal
          purchaseOrder={selectedPurchaseForReceive}
          purchaseItems={purchaseItems}
          onClose={() => setSelectedPurchaseForReceive(null)}
          onSuccess={handleReceiveSuccess}
        />
      )}
    </div>
  );
}