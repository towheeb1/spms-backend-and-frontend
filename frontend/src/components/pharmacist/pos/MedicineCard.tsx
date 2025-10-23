// src/components/pharmacist/pos/MedicineCard.tsx
import React from "react";
import type { Medicine } from "./types";
import { FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import "./style/MedicineCard.css";

function formatCurrency(amount: number, currency?: string | null): string {
  const fallbackSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "SAR" ? "﷼" : "ر.ي";
  try {
    return `${new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${fallbackSymbol}`;
  } catch {
    return `${amount.toFixed(2)} ${fallbackSymbol}`;
  }
}

interface MedicineCardProps {
  medicine: Medicine;
  isExpanded: boolean;
  onToggleDetails: (medicineId: number) => void;
  onAddToCart: (medicine: Medicine) => void;
}

export default function MedicineCard({
  medicine,
  isExpanded,
  onToggleDetails,
  onAddToCart,
}: MedicineCardProps) {
  const basePrice = Number(medicine.retail_price ?? medicine.price ?? 0);
  const stockStatus = medicine.stock !== undefined
    ? medicine.stock > 0 ? 'متوفر' : 'منتهي'
    : 'غير معروف';

  const expiryDate = medicine.expiry_date
    ? new Date(medicine.expiry_date).toLocaleDateString('ar-YE')
    : 'غير محدد';

  return (
    <>
      {/* الصف الرئيسي */}
      <tr className="medicine-card-row">
        <td className="medicine-name-cell">
          <div className="medicine-name-section">
            <span className="medicine-name">{medicine.name}</span>
            {medicine.category && (
              <span className="medicine-category">{medicine.category}</span>
            )}
          </div>
          <div className="medicine-barcode">{medicine.barcode || 'غير محدد'}</div>
        </td>
        <td className="medicine-stock-cell">
          <span className={`stock-badge ${medicine.stock === 0 ? 'stock-out' : medicine.stock && medicine.stock < 5 ? 'stock-low' : 'stock-in'}`}>
            {stockStatus}
          </span>
        </td>
        <td className="medicine-price-cell" dir="rtl">
          {formatCurrency(basePrice)}
        </td>
        <td className="medicine-expiry-cell" dir="rtl">
          {expiryDate}
        </td>
        <td className="medicine-quantity-cell">
          {medicine.stock !== undefined ? `${medicine.stock}` : '—'}
        </td>
        <td className="medicine-actions-cell">
          <button
            onClick={() => onToggleDetails(medicine.id || 0)}
            className="details-toggle-button"
            title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            aria-label={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          >
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          <button
            onClick={() => onAddToCart(medicine)}
            className="add-to-cart-button"
            aria-label="إضافة إلى السلة"
          >
            <FiPlus size={16} />
          </button>
        </td>
      </tr>

      {/* الصف الموسّع (يظهر عند التوسيع) */}
      {isExpanded && (
        <tr className="medicine-expanded-row">
          <td colSpan={6} className="medicine-expanded-cell">
            <div className="medicine-expanded-details">
              <div className="expanded-section">
                <h5 className="expanded-title">معلومات إضافية</h5>
                <div className="expanded-grid">
                  {medicine.generic_name && (
                    <div className="expanded-row">
                      <span className="expanded-label">الاسم العلمي:</span>
                      <span className="expanded-value">{medicine.generic_name}</span>
                    </div>
                  )}
                  {medicine.form && (
                    <div className="expanded-row">
                      <span className="expanded-label">الشكل:</span>
                      <span className="expanded-value">{medicine.form}</span>
                    </div>
                  )}
                  {medicine.strength && (
                    <div className="expanded-row">
                      <span className="expanded-label">التركيز:</span>
                      <span className="expanded-value">{medicine.strength}</span>
                    </div>
                  )}
                  {medicine.manufacturer && (
                    <div className="expanded-row">
                      <span className="expanded-label">الشركة المصنعة:</span>
                      <span className="expanded-value">{medicine.manufacturer}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="expanded-section">
                <h5 className="expanded-title">الأسعار</h5>
                <div className="pricing-grid">
                  {[
                    { label: "سعر الشريط", value: medicine.blister_price, hint: medicine.blisters_per_pack ? `${medicine.blisters_per_pack} شريط/باكيت` : undefined },
                    { label: "سعر الحبة", value: medicine.tablet_price, hint: medicine.tablets_per_blister ? `${medicine.tablets_per_blister} حبة` : undefined },
                    { label: "سعر الجملة", value: medicine.wholesale_price, hint: "للموزعين" },
                    { label: "سعر الكرتون", value: medicine.carton_price, hint: medicine.packs_per_carton ? `${medicine.packs_per_carton} كرتون` : undefined },
                  ]
                    .filter(tier => tier.value != null && !isNaN(Number(tier.value)))
                    .map(tier => (
                      <div key={tier.label} className="pricing-row">
                        <div className="pricing-info">
                          <span className="pricing-label">{tier.label}</span>
                          {tier.hint && <span className="pricing-hint">{tier.hint}</span>}
                        </div>
                        <span className="pricing-value">{formatCurrency(Number(tier.value))}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}