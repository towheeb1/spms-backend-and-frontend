// POSPage.tsx - Simplified POS System
import React, { useState, useEffect } from "react";
import POSCart from "./POSCart";
import POSCustomerSelect from "./POSCustomerSelect";
import POSActions from "./POSActions";
import POSPaymentModal from "./POSPaymentModal";
import POSReceiptModal from "./POSReceiptModal";
import MedicineCard from "./MedicineCard";
import { createSale } from '../../../services/sales';
import { listMedicines } from "../../../services/medicines";
import { useToast } from "../../ui/Toast";
import type { Medicine, CartItem, PaymentMethod, Customer, POSInvoice, POSPayment, POSReceipt, POSReceiptItem, SaleUnitType } from "./types";
import "./style/POSPage.css";

const INITIAL_PAGE_SIZE = 6;
const PAGE_INCREMENT = 6;

interface Props {
  customers?: Customer[];
  paymentMethods?: PaymentMethod[];
  onSaveDraft: (cart: CartItem[], customerId: number | null) => void;
  onRecordPayment: (saleId: number, methodId: number, amount: number, isChange: boolean) => Promise<void>;
  onGetReceipt: (saleId: number) => Promise<POSReceipt>;
}

export default function POSPage({
  customers = [],
  paymentMethods = [],
  onSaveDraft,
  onRecordPayment,
  onGetReceipt,
}: Props) {
  const toast = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<POSReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedMedicines, setExpandedMedicines] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);

  // جلب الأدوية عند تحميل الصفحة
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoading(true);
        const medicinesData = await listMedicines();
        setMedicines(medicinesData || []);
      } catch (error) {
        console.error('Error loading medicines:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMedicines();
  }, []);

  // تطبيق الفلترة والبحث
  useEffect(() => {
    let filtered = [...medicines];

    // فلترة حسب الفئة
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(med => med.category === categoryFilter);
    }

    // بحث في الاسم والباركود
    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMedicines(filtered);
    setVisibleCount(INITIAL_PAGE_SIZE);
    setExpandedMedicines(new Set());
  }, [medicines, categoryFilter, searchTerm]);

  // الحصول على الفئات المتاحة
  const categories = Array.from(new Set(medicines.map(med => med.category).filter(Boolean))) as string[];

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const toggleMedicineDetails = (medicineId: number) => {
    setExpandedMedicines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicineId)) {
        newSet.delete(medicineId);
      } else {
        newSet.add(medicineId);
      }
      return newSet;
    });
  };

  const determineUnitInfo = (medicine: Medicine, unit: SaleUnitType) => {
    const packsPerCarton = Number(medicine.packs_per_carton || 0) || 1;
    const blistersPerPack = Number(medicine.blisters_per_pack || 0) || 1;
    const tabletsPerBlister = Number(medicine.tablets_per_blister || 0) || 1;

    switch (unit) {
      case "carton":
        return {
          unit_price: Number(medicine.carton_price ?? medicine.wholesale_price ?? medicine.retail_price ?? medicine.price ?? 0),
          unit_label: "كرتون",
          base_quantity: packsPerCarton * blistersPerPack * tabletsPerBlister,
        };
      case "pack":
        return {
          unit_price: Number(medicine.retail_price ?? medicine.price ?? 0),
          unit_label: "باكت",
          base_quantity: blistersPerPack * tabletsPerBlister,
        };
      case "blister":
        return {
          unit_price: Number(medicine.blister_price ?? 0),
          unit_label: "شريط",
          base_quantity: tabletsPerBlister,
        };
      case "tablet":
      default:
        return {
          unit_price: Number(medicine.tablet_price ?? 0),
          unit_label: "حبة",
          base_quantity: 1,
        };
    }
  };

  const addToCart = (medicine: Medicine, unit: SaleUnitType = "pack") => {
    const { unit_price, unit_label, base_quantity } = determineUnitInfo(medicine, unit);

    setCart(prev => {
      const existing = prev.find(item => item.medicine_id === medicine.id && item.unit_type === unit);
      if (existing) {
        const newQty = existing.qty + 1;
        return prev.map(item =>
          item.medicine_id === medicine.id && item.unit_type === unit
            ? { ...item, qty: newQty, total: newQty * item.unit_price, unit_label, base_quantity }
            : item
        );
      } else {
        return [...prev, {
          medicine_id: medicine.id || 0,
          name: medicine.name,
          qty: 1,
          unit_price,
          total: unit_price,
          unit_type: unit,
          unit_label,
          base_quantity,
        }];
      }
    });

    toast.success(`تمت إضافة ${medicine.name} (${unit_label})`);
  };

  const updateCartQty = (medicineId: number, unit: SaleUnitType, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => !(item.medicine_id === medicineId && item.unit_type === unit)));
    } else {
      setCart(prev => prev.map(item =>
        item.medicine_id === medicineId && item.unit_type === unit
          ? { ...item, qty, total: qty * item.unit_price }
          : item
      ));
    }
  };

  const removeFromCart = (medicineId: number, unit: SaleUnitType) => {
    setCart(prev => prev.filter(item => !(item.medicine_id === medicineId && item.unit_type === unit)));
  };

  const visibleMedicines = filteredMedicines.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredMedicines.length;
  const canShowLess = visibleCount > INITIAL_PAGE_SIZE;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_INCREMENT, filteredMedicines.length));
  };

  const handleShowLess = () => {
    setVisibleCount(prev => Math.max(INITIAL_PAGE_SIZE, prev - PAGE_INCREMENT));
    setExpandedMedicines(prev => {
      const next = new Set(prev);
      filteredMedicines.slice(Math.max(INITIAL_PAGE_SIZE, visibleCount - PAGE_INCREMENT)).forEach((med) => {
        if (med?.id != null) next.delete(med.id);
      });
      return next;
    });
  };

  const handleSaveDraft = () => {
    onSaveDraft(cart, selectedCustomerId);
  };

  const handlePostSale = async () => {
    if (cart.length === 0) return;

    try {
      const saleItems = cart.map(item => ({
        medicine_id: item.medicine_id,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.total,
        unit_type: item.unit_type,
      }));

      const result = await createSale({
        customer_id: selectedCustomerId ?? undefined,
        branch_id: null,
        register_id: null,
        shift_id: null,
        items: saleItems,
      });

      const receipt: POSReceipt = {
        id: result.invoice.id,
        invoice: result.invoice,
        items: cart.map(item => ({
          id: Math.floor(Math.random() * 1000000),
          sale_id: result.invoice.id,
          medicine_id: item.medicine_id,
          qty: item.qty,
          unit_price: item.unit_price,
          line_total: item.total,
          medicine_name: item.name,
          name: item.name,
          unit_type: item.unit_type,
          unit_label: item.unit_label,
          base_quantity: item.base_quantity,
        })),
        payments: result.payments ?? [],
      };

      setCurrentReceipt(receipt);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      setCart([]);
      setSelectedCustomerId(null);

      toast.success(`تم إتمام البيع بنجاح! رقم الفاتورة: #${result.invoice.id}`);

      // Refresh inventory data and broadcast movement update
      localStorage.setItem('inventory_operation_completed', Date.now().toString());
      if ((window as any).refreshInventoryMovements) {
        (window as any).refreshInventoryMovements();
      }

      const medicinesData = await listMedicines();
      setMedicines(medicinesData || []);
    } catch (error) {
      console.error('فشل في إتمام البيع:', error);
      toast.error('فشل في إتمام البيع. يرجى المحاولة مرة أخرى.');
    }
  };

  const handlePayment = async (methodId: number, amount: number, isChange: boolean) => {
    if (!currentReceipt) return;
    await onRecordPayment(currentReceipt.invoice.id, methodId, amount, isChange);
    const receipt = await onGetReceipt(currentReceipt.invoice.id);
    setCurrentReceipt(receipt);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  const closeReceipt = () => {
    setShowReceiptModal(false);
    setCart([]);
  };

  return (
    <div className="pos-page-container">
      <div className="pos-page-main">
        <POSCustomerSelect
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />

        <div className="pos-medicines-section">
          <div className="pos-medicines-header">
            <div className="pos-medicines-title-section">
              <h3 className="pos-medicines-title">الأدوية المتاحة</h3>
              <div className="pos-medicines-count">
                {medicines.length} دواء متاح
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="pos-refresh-button"
            >
              🔄 تحديث
            </button>
          </div>

          <div className="pos-search-container">
            <div className="pos-search-input-wrapper">
              <input
                type="text"
                placeholder="البحث في الأدوية بالاسم أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pos-search-input"
              />
              <div className="pos-search-icon">🔍</div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="pos-search-clear"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="pos-category-filters">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`pos-category-button ${categoryFilter === 'all' ? 'all' : 'unselected'}`}
            >
              جميع الفئات ({medicines.length})
            </button>
            {categories.map(category => {
              const count = medicines.filter(med => med.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`pos-category-button ${categoryFilter === category ? 'selected' : 'unselected'}`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {searchTerm && (
            <div className="pos-search-results">
              نتائج البحث: {filteredMedicines.length} من {medicines.length} دواء
            </div>
          )}

          {loading ? (
            <div className="pos-loading-center">
              <div className="pos-loading-large"></div>
            </div>
          ) : (
            <div className="pos-medicine-table-container">
              <table className="pos-medicine-table">
                <thead>
                  <tr className="medicine-table-header">
                    <th>الدواء</th>
                    <th>الحالة</th>
                    <th>السعر</th>
                    <th>تاريخ الانتهاء</th>
                    <th>الكمية</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMedicines.map((medicine) => {
                    const isExpanded = expandedMedicines.has(medicine.id || 0);

                    return (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        isExpanded={isExpanded}
                        onToggleDetails={toggleMedicineDetails}
                        onAddToCart={addToCart}
                      />
                    );
                  })}
                </tbody>
              </table>

              {(canLoadMore || canShowLess) && (
                <div className="pos-load-more-container">
                  {canShowLess && (
                    <button
                      type="button"
                      className="pos-load-more-button pos-load-more-button--secondary"
                      onClick={handleShowLess}
                    >
                      عرض عناصر أقل
                      <span className="pos-load-more-hint">
                        سيتم إخفاء {Math.min(PAGE_INCREMENT, visibleCount - INITIAL_PAGE_SIZE)} عناصر
                      </span>
                    </button>
                  )}
                  {canLoadMore && (
                    <button
                      type="button"
                      className="pos-load-more-button"
                      onClick={handleLoadMore}
                    >
                      عرض المزيد من الأدوية
                      <span className="pos-load-more-hint">
                        سيتم تحميل {Math.min(PAGE_INCREMENT, filteredMedicines.length - visibleCount)} عناصر إضافية
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && filteredMedicines.length === 0 && (
            <div className="pos-empty-container">
              {searchTerm || categoryFilter !== 'all' ?
                `لا توجد أدوية تطابق معايير البحث. جرب تغيير كلمات البحث أو الفئة.` :
                `لا توجد أدوية متاحة في المخزون. يرجى إضافة أدوية أولاً من خلال استلام أمر شراء.`
              }
            </div>
          )}
        </div>

        <POSCart
          cart={cart}
          onQtyChange={updateCartQty}
          onDelete={removeFromCart}
          total={total}
        />
      </div>

      <div className="pos-sidebar">
        <POSActions
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
          onPrint={() => console.log('طباعة الفاتورة')}
          onSave={() => console.log('حفظ الفاتورة')}
        />
      )}
    </div>
  );
}