/**
 * منطق حساب الكميات في ReceivePurchaseModal:
 *
 * 1. يتم حساب الكمية المتبقية لكل عنصر: remainingQty = item.quantity - (item.received_qty || 0)
 * 2. يظهر النموذج فقط للعناصر التي يمكن استلامها: canReceive = remainingQty > 0
 * 3. يتم تحديث البيانات فوراً بعد الاستلام مع تأخير قصير للتأكد من اكتمال التحديثات في قاعدة البيانات
 * 4. زر "استلام البضاعة" يظهر طالما أن هناك كميات متبقية (remaining_quantity > 0)
 * 5. يتم دعم الاستلام الجزئي والمتعدد لنفس أمر الشراء
 */
import React, { useState, useEffect } from 'react';
import { receivePurchaseOrder, ReceivePurchaseItem } from '../../../services/suppliers';
import { useToast } from '../../ui/Toast';
import './ReceivePurchaseModal.css';

interface PurchaseOrder {
  id: number;
  supplier_name?: string;
  status: string;
  total_amount: number;
  currency?: string;
  created_at: string;
  supplier_reference?: string | null;
}

interface PurchaseOrderItem {
  id: number;
  name: string;
  quantity: number;
  received_qty?: number;
  price: number;
  barcode?: string;
  batch_no?: string;
  expiry_date?: string;
  // الحقول الجديدة من قاعدة البيانات
  wholesale_price?: number;
  retail_price?: number;
  blister_price?: number;
  tablet_price?: number;
  packs_per_carton?: number;
  blisters_per_pack?: number;
  tablets_per_blister?: number;
}

interface ReceiveItemState extends ReceivePurchaseItem {
  maxReceivable: number;
}

interface Props {
  purchaseOrder: PurchaseOrder;
  purchaseItems: PurchaseOrderItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReceivePurchaseModal({
  purchaseOrder,
  purchaseItems,
  onClose,
  onSuccess
}: Props) {
  const toast = useToast();
  const [receivedItems, setReceivedItems] = useState<ReceiveItemState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تهيئة البيانات عند فتح المودال
  useEffect(() => {
    const initialItems: ReceiveItemState[] = purchaseItems.map(item => {
      const alreadyReceived = Number(item.received_qty || 0);
      const outstanding = Math.max(item.quantity - alreadyReceived, 0);
      return {
        purchase_item_id: item.id,
        received_qty: 0,
        batch_no: item.batch_no || '',
        expiry_date: item.expiry_date || '',
        maxReceivable: outstanding,
      };
    });
    setReceivedItems(initialItems);
  }, [purchaseItems]);

  const handleQuantityChange = (itemId: number, receivedQty: number) => {
    if (receivedQty < 0) receivedQty = 0;
    setReceivedItems(prev => prev.map(item =>
      item.purchase_item_id === itemId
        ? { ...item, received_qty: Math.min(receivedQty, item.maxReceivable) }
        : item
    ));
  };

  const handleBatchNoChange = (itemId: number, batchNo: string) => {
    setReceivedItems(prev => prev.map(item =>
      item.purchase_item_id === itemId
      ? { 
          ...item, 
          batch_no: batchNo != null && batchNo.trim().length > 0 ? batchNo.trim() : null 
        }
        : item
    ));
  };

  const handleExpiryDateChange = (itemId: number, expiryDate: string) => {
    setReceivedItems(prev => prev.map(item =>
      item.purchase_item_id === itemId
        ? { ...item, expiry_date: expiryDate && expiryDate.trim() !== '' ? expiryDate : null }
        : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    const payload = receivedItems
      .filter(item => item.maxReceivable > 0 && item.received_qty > 0)
      .map(({ maxReceivable, ...rest }) => rest);

    if (!payload.length) {
      toast.error('يرجى التأكد من صحة الكميات المستلمة', 'خطأ في البيانات');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await receivePurchaseOrder(purchaseOrder.id, payload);

      if (response.success) {
        toast.success(response.message, 'تم الاستلام بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message, 'خطأ في الاستلام');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء استلام أمر الشراء', 'خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReceived = receivedItems.reduce((sum, item) => sum + (item.maxReceivable > 0 ? item.received_qty : 0), 0);
  const totalValue = receivedItems.reduce((sum, item) => {
    const purchaseItem = purchaseItems.find(pi => pi.id === item.purchase_item_id);
    if (!purchaseItem || item.maxReceivable <= 0) return sum;
    return sum + (item.received_qty * (purchaseItem?.price || 0));
  }, 0);

  return (
    <div className="receive-modal-overlay">
      <div className="receive-modal-content">
        <div className="receive-modal-header">
          <h3 className="receive-modal-title">
            استلام أمر شراء #{purchaseOrder.id}
            <span className={`receive-modal-status-badge ${
              purchaseOrder.status === 'ordered' ? 'receive-modal-status-pending' : 'receive-modal-status-received'
            }`}>
              {purchaseOrder.status === 'ordered' ? 'في الانتظار' : 'مستلم'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="receive-modal-close-button"
          >
            ✕
          </button>
        </div>

        <div className="receive-modal-info-section">
          <h4 className="receive-modal-info-title">معلومات أمر الشراء</h4>
          <div className="receive-modal-info-grid">
            <div className="receive-modal-info-item">
              <span>المورد:</span>
              <div>{purchaseOrder.supplier_name || 'غير محدد'}</div>
            </div>
            <div className="receive-modal-info-item">
              <span>إجمالي المبلغ:</span>
              <div>{purchaseOrder.total_amount} {purchaseOrder.currency || 'YER'}</div>
            </div>
            <div className="receive-modal-info-item">
              <span>تاريخ الإنشاء:</span>
              <div>{new Date(purchaseOrder.created_at).toLocaleDateString('ar-YE')}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="receive-modal-form">
          <div className="receive-modal-section">
            <h4 className="receive-modal-section-title">عناصر الاستلام</h4>

            {purchaseItems.map((item, index) => {
              const receivedItem = receivedItems.find(ri => ri.purchase_item_id === item.id);
              const remainingQty = item.quantity - (item.received_qty || 0);
              const canReceive = remainingQty > 0;

              return (
                <div key={item.id} className={`receive-modal-item-card ${
                  canReceive ? 'receive-modal-item-card-receivable' : 'receive-modal-item-card-completed'
                }`}>
                  <div className="receive-modal-item-header">
                    <div className="receive-modal-item-info">
                      <h5>{item.name}</h5>
                      <p>
                        الكمية المطلوبة: {item.quantity} |
                        مستلم سابقاً: {item.received_qty || 0} |
                        متبقي: {remainingQty}
                      </p>
                    </div>
                    <div className={`receive-modal-item-status ${
                      canReceive ? 'receive-modal-item-status-receivable' : 'receive-modal-item-status-completed'
                    }`}>
                      {canReceive ? 'يمكن الاستلام' : 'تم الاستلام بالكامل'}
                    </div>
                  </div>

                  {canReceive && (
                    <div className="receive-modal-form-grid">
                      <div className="receive-modal-form-group">
                        <label>
                          الكمية المستلمة *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={remainingQty}
                          value={receivedItem?.received_qty || 0}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="receive-modal-input"
                          required
                        />
                      </div>

                      <div className="receive-modal-form-group">
                        <label>
                          رقم الدفعة
                        </label>
                        <input
                          type="text"
                          value={receivedItem?.batch_no || ''}
                          onChange={(e) => handleBatchNoChange(item.id, e.target.value)}
                          className="receive-modal-input"
                          placeholder="اختياري"
                        />
                      </div>

                      <div className="receive-modal-form-group">
                        <label>
                          رقم الفاتورة
                        </label>
                        <input
                          type="text"
                          value={purchaseOrder.supplier_reference || ''}
                          disabled
                          className="receive-modal-input"
                        />
                      </div>

                      {/* عرض الأسعار المحسوبة من قاعدة البيانات */}
                      {item.retail_price && (
                        <div className="receive-modal-form-group">
                          <label>سعر التجزئة (للباكيت)</label>
                          <div className="receive-modal-input receive-modal-price-display">
                            {item.retail_price} {purchaseOrder.currency || 'YER'}
                          </div>
                        </div>
                      )}

                      {item.blister_price && (
                        <div className="receive-modal-form-group">
                          <label>سعر الشريط</label>
                          <div className="receive-modal-input receive-modal-price-display">
                            {item.blister_price} {purchaseOrder.currency || 'YER'}
                          </div>
                        </div>
                      )}

                      {item.tablet_price && (
                        <div className="receive-modal-form-group">
                          <label>سعر الحبة</label>
                          <div className="receive-modal-input receive-modal-price-display">
                            {item.tablet_price} {purchaseOrder.currency || 'YER'}
                          </div>
                        </div>
                      )}

                      <div className="receive-modal-value-display">
                        <div className="receive-modal-value-box">
                          <div className="receive-modal-value-label">قيمة الاستلام</div>
                          <div className="receive-modal-value-amount">
                            {((receivedItem?.received_qty || 0) * item.price).toFixed(2)} {purchaseOrder.currency || 'YER'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="receive-modal-summary-section">
            <h4 className="receive-modal-summary-title">ملخص الاستلام</h4>
            <div className="receive-modal-summary-grid">
              <div className="receive-modal-summary-item">
                <span>إجمالي الكمية المستلمة:</span>
                <div>{totalReceived}</div>
              </div>
              <div className="receive-modal-summary-item">
                <span>إجمالي القيمة:</span>
                <div className="receive-modal-summary-value">{totalValue.toFixed(2)} {purchaseOrder.currency || 'YER'}</div>
              </div>
              <div className="receive-modal-summary-item">
                <span>عدد العناصر:</span>
                <div>{receivedItems.filter(item => item.received_qty > 0).length}</div>
              </div>
            </div>
          </div>

          <div className="receive-modal-actions">
            <button
              type="submit"
              disabled={isSubmitting || receivedItems.filter(item => item.received_qty > 0).length === 0}
              className="receive-modal-button-submit"
            >
              {isSubmitting ? 'جاري الاستلام...' : 'تأكيد الاستلام'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="receive-modal-button-cancel"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
