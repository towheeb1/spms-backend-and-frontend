import { Field } from "./SectionLayout";
import { Select } from "../../../ui/Select";
import { PurchaseItemWithBranch, BranchOption } from "./types";
import { FiPlus, FiTrash2, FiPackage, FiDollarSign } from "react-icons/fi";
import '../style/SectionItems.css';

interface SectionItemsProps {
  items: PurchaseItemWithBranch[];
  currency: string;
  branchesOptions: BranchOption[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof PurchaseItemWithBranch, value: string | number | null) => void;
}

const unitOptions = [
  { label: "كرتون", value: "carton" },
  { label: "باكيت", value: "pack" },
  { label: "شريط", value: "blister" },
];

const normalizeUnit = (unit?: string | null) => {
  switch (unit) {
    case "carton":
    case "pack":
    case "blister":
      return unit;
    case "صندوق":
    case "علبة":
      return "carton";
    case "عبوة":
      return "pack";
    case "شريط":
      return "blister";
    default:
      return "carton";
  }
};

// دالة حسابية محسّنة
const calculatePrices = (item: PurchaseItemWithBranch) => {
  const {
    quantity = 0,
    wholesale_price = 0,
    carton_price = 0,
    packs_per_carton = 1,
    blisters_per_pack = 1,
    tablets_per_blister = 1,
    unit = "carton",
  } = item;

  let retailPrice = 0;
  let blisterPrice = 0;
  let tabletPrice = 0;
  let subtotal = 0;

  // حساب الكمية الإجمالية حسب الوحدة
  let totalUnits = quantity;
  if (unit === "pack") {
    totalUnits = quantity * packs_per_carton;
  } else if (unit === "blister") {
    totalUnits = quantity * packs_per_carton * blisters_per_pack;
  }

  // حساب سعر الوحدة (الكرتون)
  const purchaseCartonPrice = Number(wholesale_price) || 0;
  const saleCartonPrice = Number(carton_price ?? wholesale_price) || 0;

  const purchasePackPrice = packs_per_carton > 0 ? purchaseCartonPrice / packs_per_carton : 0;
  const purchaseBlisterPrice =
    packs_per_carton > 0 && blisters_per_pack > 0 ? purchasePackPrice / blisters_per_pack : 0;

  // حساب أسعار البيع بناءً على سعر بيع الكرتون
  if (packs_per_carton > 0) {
    retailPrice = saleCartonPrice / packs_per_carton;
  }

  if (packs_per_carton > 0 && blisters_per_pack > 0) {
    blisterPrice = retailPrice / blisters_per_pack;
  }

  if (blisters_per_pack > 0 && tablets_per_blister > 0) {
    tabletPrice = blisterPrice / tablets_per_blister;
  }

  // حساب المجموع بناءً على سعر الشراء
  if (unit === "carton") {
    subtotal = quantity * purchaseCartonPrice;
  } else if (unit === "pack") {
    subtotal = quantity * purchasePackPrice;
  } else if (unit === "blister") {
    subtotal = quantity * purchaseBlisterPrice;
  }

  return {
    retailPrice: parseFloat(retailPrice.toFixed(2)),
    blisterPrice: parseFloat(blisterPrice.toFixed(2)),
    tabletPrice: parseFloat(tabletPrice.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalUnits: parseFloat(totalUnits.toFixed(2)),
  };
};

export function SectionItems({ items, currency, branchesOptions, onAdd, onRemove, onUpdate }: SectionItemsProps) {
  return (
    <section className="section-items-container">
      <div className="section-items-header">
        <h4 className="section-items-title">
          <FiPackage className="section-items-title-icon" />
          عناصر الطلب
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="section-items-add-button"
        >
          <FiPlus size={14} />
          <span>إضافة عنصر</span>
        </button>
      </div>

      <div className="section-items-grid">
        {items.map((item, index) => {
          // حساب الأسعار ديناميكيًا
          const { retailPrice, blisterPrice, tabletPrice, subtotal } = calculatePrices(item);

          return (
            <div key={index} className="section-items-card">
              <div className="section-items-form-grid">
                {/* اسم الدواء */}
                <Field label="اسم الدواء">
                  <input
                    type="text"
                    placeholder="اسم الدواء أو المنتج"
                    className="input w-full"
                    value={item.name || ""}
                    onChange={(e) => onUpdate(index, "name", e.target.value)}
                    required
                  />
                </Field>

                {/* الفئة */}
                <Field label="الفئة">
                  <input
                    type="text"
                    placeholder="مثال: مسكنات"
                    className="input w-full"
                    value={item.category || ""}
                    onChange={(e) => onUpdate(index, "category", e.target.value)}
                  />
                </Field>

                {/* الباركود */}
                <Field label="الباركود">
                  <input
                    type="text"
                    placeholder="أدخل الباركود"
                    className="input w-full"
                    value={item.barcode || ""}
                    onChange={(e) => onUpdate(index, "barcode", e.target.value)}
                  />
                </Field>

                {/* الكمية */}
                <Field label="الكمية">
                  <input
                    type="number"
                    placeholder="الكمية"
                    className="input w-full"
                    value={item.quantity || ""}
                    onChange={(e) => onUpdate(index, "quantity", Number(e.target.value) || 0)}
                    min={1}
                    required
                  />
                </Field>

                {/* الوحدة */}
                <Field label="الوحدة">
                  <Select
                    value={normalizeUnit(item.unit)}
                    onChange={(v) => onUpdate(index, "unit", String(v))}
                    options={unitOptions}
                    placeholder="اختر وحدة الطلب"
                  />
                </Field>

                {/* عدد الباكيت في الكرتون */}
                <Field label="عدد الباكيت/الكرتون">
                  <input
                    type="number"
                    placeholder="مثلاً: 24"
                    className="input w-full"
                    value={item.packs_per_carton || ""}
                    onChange={(e) => onUpdate(index, "packs_per_carton", Number(e.target.value) || 0)}
                    min={1}
                  />
                </Field>

                {/* عدد الشرائط في الباكيت */}
                <Field label="عدد الشرائط/الباكيت">
                  <input
                    type="number"
                    placeholder="مثلاً: 2"
                    className="input w-full"
                    value={item.blisters_per_pack || ""}
                    onChange={(e) => onUpdate(index, "blisters_per_pack", Number(e.target.value) || 0)}
                    min={1}
                  />
                </Field>

                {/* عدد الأقراص في الشريط */}
                <Field label="عدد الأقراص/الشريط">
                  <input
                    type="number"
                    placeholder="مثلاً: 10"
                    className="input w-full"
                    value={item.tablets_per_blister || ""}
                    onChange={(e) => onUpdate(index, "tablets_per_blister", Number(e.target.value) || 0)}
                    min={1}
                  />
                </Field>

                {/* فرع الاستلام */}
                <Field label="فرع الاستلام">
                  <Select
                    value={item.branch || branchesOptions[0]?.value || ""}
                    onChange={(v) => onUpdate(index, "branch", String(v))}
                    options={branchesOptions}
                    placeholder="اختر فرع الاستلام"
                  />
                </Field>

                {/* سعر الجملة */}
                <Field label="سعر الجملة/الكرتون">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="سعر شراء الكرتون"
                      className="input w-full pr-8"
                      value={item.wholesale_price || ""}
                      onChange={(e) => onUpdate(index, "wholesale_price", Number(e.target.value) || 0)}
                      min={0}
                      required
                    />
                    <FiDollarSign className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </Field>

                {/* سعر بيع الكرتون */}
                <Field label="سعر بيع الكرتون">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="سعر بيع الكرتون"
                      className="input w-full pr-8"
                      value={item.carton_price || ""}
                      onChange={(e) => onUpdate(index, "carton_price", Number(e.target.value) || 0)}
                      min={0}
                    />
                    <FiDollarSign className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </Field>

                {/* سعر التجزئة */}
                <Field label="سعر التجزئة/الباكيت">
                  <div className="section-items-price-display section-items-price-retail">
                    {retailPrice.toFixed(2)} {currency}
                  </div>
                </Field>

                {/* سعر الشريط */}
                <Field label="سعر الشريط">
                  <div className="section-items-price-display section-items-price-blister">
                    {blisterPrice.toFixed(2)} {currency}
                  </div>
                </Field>

                {/* سعر الحبة */}
                <Field label="سعر الحبة">
                  <div className="section-items-price-display section-items-price-tablet">
                    {tabletPrice.toFixed(2)} {currency}
                  </div>
                </Field>

                {/* المجموع */}
                <Field label="المجموع">
                  <div className="section-items-price-display section-items-price-total">
                    {subtotal.toFixed(2)} {currency}
                  </div>
                </Field>

                {/* زر الحذف */}
                <div className="section-items-delete-container">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="section-items-delete-button"
                    disabled={items.length === 1}
                  >
                    <FiTrash2 size={14} />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}