// src/components/pharmacist/pos/MedicineCard.tsx
import React, { useMemo, useState } from "react";
import type { Medicine, SaleUnitType } from "./types";
import { FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import "./style/MedicineCard.css";
import { Select } from "../../ui/Select";

function formatCurrency(amount: number, currency?: string | null): string {
  const fallbackSymbol =
    currency === "USD" ? "$" :
    currency === "EUR" ? "€" :
    currency === "SAR" ? "﷼"  : "ر.ي";
  try {
    return `${new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${fallbackSymbol}`;
  } catch {
    return `${amount.toFixed(2)} ${fallbackSymbol}`;
  }
}

/** ====== تحويل الكميات بحسب الوحدة المختارة ====== */
type Unit = "carton" | "pack" | "blister" | "tablet";

// عوامل التحويل من الحبة (base)
const factors = (m: Medicine) => {
  const tpb = Math.max(1, Number(m.tablets_per_blister ?? 1)); // حبات/شريط
  const bpp = Math.max(1, Number(m.blisters_per_pack   ?? 1)); // أشرطة/باكت
  const ppc = Math.max(1, Number(m.packs_per_carton    ?? 1)); // بواكت/كرتون
  return {
    perBlister: tpb,
    perPack: bpp * tpb,
    perCarton: ppc * bpp * tpb,
  };
};

const qtyInUnit = (baseQtyTablets: number, unit: Unit, f: ReturnType<typeof factors>) => {
  const q = Number(baseQtyTablets || 0);
  if (q <= 0) return 0;
  switch (unit) {
    case "carton":  return Math.floor(q / Math.max(1, f.perCarton));
    case "pack":    return Math.floor(q / Math.max(1, f.perPack));
    case "blister": return Math.floor(q / Math.max(1, f.perBlister));
    case "tablet":
    default:        return Math.floor(q);
  }
};
/** ================================================== */

/** ====== سعر الوحدة المختارة (عرض فقط في الكارت/اللستة) ======
 * نفس منطقك المبسّط في POSPage.determineUnitInfo لضمان الاتساق بصرياً.
 */
const unitPriceFor = (m: Medicine, unit: Unit) => {
  switch (unit) {
    case "carton":
      return Number(m.carton_price ?? m.wholesale_price ?? m.retail_price ?? m.price ?? 0);
    case "pack":
      return Number(m.retail_price ?? m.price ?? 0);
    case "blister":
      return Number(m.blister_price ?? 0);
    case "tablet":
    default:
      return Number(m.tablet_price ?? 0);
  }
};
/** ============================================================== */

interface MedicineCardProps {
  medicine: Medicine;
  isExpanded: boolean;
  onToggleDetails: (medicineId: number) => void;
  onAddToCart: (medicine: Medicine, unit: SaleUnitType) => void;
}

export default function MedicineCard({
  medicine,
  isExpanded,
  onToggleDetails,
  onAddToCart,
}: MedicineCardProps) {
  const unitOptions = useMemo(
    () => [
      { value: "carton",  label: "كرتون", disabled: Number(medicine.carton_price ?? 0)  <= 0 && Number(medicine.wholesale_price ?? 0) <= 0 && Number(medicine.retail_price ?? medicine.price ?? 0) <= 0 },
      { value: "pack",    label: "باكت",  disabled: Number(medicine.retail_price ?? medicine.price ?? 0) <= 0 },
      { value: "blister", label: "شريط",  disabled: Number(medicine.blister_price ?? 0) <= 0 },
      { value: "tablet",  label: "حبة",   disabled: Number(medicine.tablet_price ?? 0)  <= 0 },
    ],
    [medicine.blister_price, medicine.carton_price, medicine.price, medicine.retail_price, medicine.tablet_price, medicine.wholesale_price]
  );

  const [selectedUnit, setSelectedUnit] = useState<SaleUnitType>(() => {
    if (!unitOptions.find((opt) => opt.value === "pack" && !opt.disabled)) {
      const firstAvailable = unitOptions.find((opt) => !opt.disabled);
      return (firstAvailable?.value as SaleUnitType | undefined) ?? "pack";
    }
    return "pack";
  });

  /** الحالة والإنتهاء (كما هي) */
  const stockStatus =
    medicine.stock !== undefined
      ? medicine.stock > 0 ? "متوفر" : "منتهي"
      : "غير معروف";

  const expiryDate = medicine.expiry_date
    ? new Date(medicine.expiry_date).toLocaleDateString("ar-YE")
    : "غير محدد";

  /** الكمية المعروضة حسب الوحدة */
  const f = useMemo(() => factors(medicine), [medicine]);
  const displayQty = useMemo(
    () => qtyInUnit(Number(medicine.stock ?? 0), selectedUnit as Unit, f),
    [medicine.stock, selectedUnit, f]
  );

  /** السعر المعروض حسب الوحدة المختارة */
  const displayPrice = useMemo(
    () => unitPriceFor(medicine, selectedUnit as Unit),
    [medicine, selectedUnit]
  );

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
          <div className="medicine-barcode">{medicine.barcode || "غير محدد"}</div>
        </td>

        <td className="medicine-stock-cell">
          <span
            className={`stock-badge ${
              medicine.stock === 0
                ? "stock-out"
                : medicine.stock && medicine.stock < 5
                ? "stock-low"
                : "stock-in"
            }`}
          >
            {stockStatus}
          </span>
        </td>

        {/* السعر — الآن حسب الوحدة المختارة */}
        <td className="medicine-price-cell" dir="rtl">
          {formatCurrency(displayPrice)}
        </td>

        <td className="medicine-expiry-cell" dir="rtl">
          {expiryDate}
        </td>

        {/* الكمية — حسب الوحدة المختارة */}
        <td className="medicine-quantity-cell">
          {medicine.stock !== undefined ? `${displayQty}` : "—"}
        </td>

        <td className="medicine-actions-cell">
          <button
            onClick={() => onToggleDetails(medicine.id || 0)}
            className="details-toggle-button"
            title={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            aria-label={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
          >
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>

          <div className="medicine-actions-group">
            <Select
              value={selectedUnit}
              options={unitOptions}
              onChange={(value) => setSelectedUnit(value as SaleUnitType)}
              className="unit-select-wrapper"
              menuClassName="unit-select-menu"
              optionClassName="unit-select-option"
              placeholder="اختر الوحدة"
            />
            <button
              onClick={() => onAddToCart(medicine, selectedUnit)}
              className="add-to-cart-button"
              aria-label="إضافة إلى السلة"
            >
              <FiPlus size={16} />
            </button>
          </div>
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
                    { label: "سعر الحبة", value: medicine.tablet_price, hint: medicine.tablets_per_blister ? `${medicine.tablets_per_blister} حبة/شريط` : undefined },
                    { label: "سعر الجملة", value: medicine.wholesale_price, hint: "للموزعين" },
                    { label: "سعر الكرتون", value: medicine.carton_price, hint: medicine.packs_per_carton ? `${medicine.packs_per_carton} باكت/كرتون` : undefined },
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
