// backend/src/interfaces/types/medicine.types.js

/**
 * @typedef {Object} MedicineData
 * @property {string} name - اسم الدواء
 * @property {string} generic_name - الاسم العلمي
 * @property {string} form - شكل الدواء (أقراص، شراب، إلخ)
 * @property {string} strength - تركيز الدواء
 * @property {string} barcode - الباركود
 * @property {number} price - السعر
 * @property {number} stock_qty - الكمية في المخزون
 * @property {number} min_stock - الحد الأدنى للمخزون
 * @property {number} category_id - معرف الفئة
 * @property {string} manufacturer - الشركة المصنعة
 * @property {string} dosage_form - شكل الجرعة
 * @property {string} atc_code - كود ATC
 * @property {string} expiry_date - تاريخ الانتهاء
 * @property {string} batch_no - رقم الدفعة
 */

/**
 * @typedef {Object} MedicineSearchParams
 * @property {string} q - نص البحث
 * @property {number} category_id - معرف الفئة للتصفية
 * @property {number} page - رقم الصفحة
 * @property {number} limit - عدد العناصر في الصفحة
 * @property {string} sort_by - حقل الترتيب
 * @property {string} sort_order - اتجاه الترتيب
 */

/**
 * @typedef {Object} MedicineStockUpdate
 * @property {number} medicine_id - معرف الدواء
 * @property {number} quantity_change - التغيير في الكمية (+ أو -)
 * @property {string} reason - سبب التغيير
 * @property {Object} reference - مرجع العملية
 * @property {string} reference.type - نوع المرجع
 * @property {number} reference.id - معرف المرجع
 * @property {string} notes - ملاحظات إضافية
 */

/**
 * @typedef {Object} MedicineFilter
 * @property {string} name - اسم الدواء
 * @property {string} generic_name - الاسم العلمي
 * @property {string} barcode - الباركود
 * @property {number} category_id - معرف الفئة
 * @property {number} min_stock - الحد الأدنى للمخزون
 * @property {number} max_stock - الحد الأقصى للمخزون
 * @property {string} expiry_before - انتهاء قبل تاريخ معين
 * @property {string} expiry_after - انتهاء بعد تاريخ معين
 */

/**
 * @typedef {Object} MedicineBatch
 * @property {string} batch_no - رقم الدفعة
 * @property {string} expiry_date - تاريخ الانتهاء
 * @property {number} quantity - الكمية
 * @property {number} unit_price - سعر الوحدة
 * @property {string} supplier_name - اسم المورد
 * @property {string} purchase_date - تاريخ الشراء
 */

/**
 * @typedef {Object} MedicineInventory
 * @property {number} medicine_id - معرف الدواء
 * @property {string} name - اسم الدواء
 * @property {number} total_stock - إجمالي المخزون
 * @property {number} available_stock - المخزون المتاح
 * @property {number} reserved_stock - المخزون المحجوز
 * @property {Array<MedicineBatch>} batches - دفعات الدواء
 * @property {string} last_updated - آخر تحديث
 * @property {number} min_stock_level - الحد الأدنى للمخزون
 * @property {number} max_stock_level - الحد الأقصى للمخزون
 */

/**
 * @typedef {Object} MedicineCategory
 * @property {number} id - معرف الفئة
 * @property {string} name - اسم الفئة
 * @property {string} description - وصف الفئة
 * @property {string} color - لون الفئة (للواجهة)
 * @property {boolean} is_active - حالة التفعيل
 * @property {number} parent_id - معرف الفئة الأب
 * @property {Array<MedicineCategory>} children - الفئات الفرعية
 */

/**
 * @typedef {Object} MedicinePriceHistory
 * @property {number} id - معرف السجل
 * @property {number} medicine_id - معرف الدواء
 * @property {number} old_price - السعر القديم
 * @property {number} new_price - السعر الجديد
 * @property {string} change_date - تاريخ التغيير
 * @property {string} change_reason - سبب التغيير
 * @property {number} changed_by - معرف المستخدم الذي قام بالتغيير
 */

export {};
