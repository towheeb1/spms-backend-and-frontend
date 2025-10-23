// backend/src/interfaces/types/purchase.types.js

/**
 * @typedef {Object} PurchaseOrderData
 * @property {number} supplier_id - معرف المورد
 * @property {Array<PurchaseItemData>} items - عناصر الطلب
 * @property {string} notes - ملاحظات الطلب
 * @property {string} currency - العملة
 * @property {string} supplier_reference - مرجع المورد
 * @property {number} exchange_rate - سعر الصرف
 * @property {string} order_date - تاريخ الطلب
 * @property {string} expected_date - تاريخ الاستلام المتوقع
 * @property {string} payment_terms - شروط الدفع
 * @property {number} credit_days - أيام الائتمان
 * @property {number} down_payment - الدفعة المقدمة
 * @property {number} installments_count - عدد الأقساط
 * @property {string} installment_frequency - تكرار الأقساط
 * @property {string} first_due_date - تاريخ الاستحقاق الأول
 * @property {string} shipping_terms - شروط الشحن
 * @property {number} total_amount - إجمالي المبلغ
 * @property {number} amount_received - المبلغ المستلم
 * @property {number} amount_remaining - المبلغ المتبقي
 * @property {string} expiry_date - تاريخ انتهاء الطلب
 */

/**
 * @typedef {Object} PurchaseItemData
 * @property {string} name - اسم العنصر
 * @property {string} category - الفئة
 * @property {string} barcode - الباركود
 * @property {number} quantity - الكمية
 * @property {string} unit - الوحدة (كرتون، باكيت، شريط، حبة)
 * @property {number} packs_per_carton - عدد الباكيت في الكرتون
 * @property {number} blisters_per_pack - عدد الشرائط في الباكيت
 * @property {number} tablets_per_blister - عدد الأقراص في الشريط
 * @property {string} branch - فرع الاستلام
 * @property {number} wholesale_price - سعر الجملة (للكرتون)
 * @property {number} retail_price - سعر التجزئة (للباكيت)
 * @property {number} blister_price - سعر الشريط
 * @property {number} tablet_price - سعر الحبة
 * @property {number} subtotal - إجمالي السطر
 * @property {string} batch_no - رقم الدفعة
 * @property {string} expiry_date - تاريخ الانتهاء
 * @property {string} supplier_item_code - كود العنصر لدى المورد
 * @property {number} discount_percent - نسبة الخصم
 * @property {number} discount_value - قيمة الخصم
 * @property {number} free_qty - الكمية المجانية
 * @property {boolean} is_bonus - هل هو بونص
 * @property {Object} taxes - الضرائب
 * @property {number} extra_charges_share - حصة المصاريف الإضافية
 */

/**
 * @typedef {Object} PurchasePayment
 * @property {number} purchase_id - معرف أمر الشراء
 * @property {number} amount - مبلغ الدفع
 * @property {string} payment_date - تاريخ الدفع
 * @property {string} payment_method - طريقة الدفع
 * @property {string} reference - مرجع الدفع
 * @property {string} notes - ملاحظات الدفع
 */

/**
 * @typedef {Object} PurchaseStatus
 * @property {string} status - حالة الطلب (ordered, received, partial, cancelled)
 * @property {string} status_date - تاريخ تغيير الحالة
 * @property {string} status_notes - ملاحظات الحالة
 * @property {number} updated_by - معرف المستخدم الذي قام بالتحديث
 */

/**
 * @typedef {Object} PurchaseAnalytics
 * @property {number} total_orders - إجمالي عدد الطلبات
 * @property {number} total_value - إجمالي القيمة
 * @property {number} average_order_value - متوسط قيمة الطلب
 * @property {number} total_paid - إجمالي المدفوعات
 * @property {number} total_outstanding - إجمالي المستحقات
 * @property {Array<PurchaseTrend>} trends - اتجاهات الطلبات
 * @property {Array<SupplierStats>} top_suppliers - أفضل الموردين
 */

/**
 * @typedef {Object} PurchaseTrend
 * @property {string} period - الفترة (YYYY-MM)
 * @property {number} order_count - عدد الطلبات
 * @property {number} total_value - إجمالي القيمة
 * @property {number} average_value - متوسط القيمة
 */

/**
 * @typedef {Object} SupplierStats
 * @property {number} supplier_id - معرف المورد
 * @property {string} supplier_name - اسم المورد
 * @property {number} order_count - عدد الطلبات
 * @property {number} total_value - إجمالي القيمة
 * @property {number} average_order_value - متوسط قيمة الطلب
 * @property {string} last_order_date - تاريخ آخر طلب
 */

/**
 * @typedef {Object} PurchaseReport
 * @property {string} report_type - نوع التقرير
 * @property {string} date_from - تاريخ البداية
 * @property {string} date_to - تاريخ النهاية
 * @property {number} supplier_id - معرف المورد (اختياري)
 * @property {string} status - حالة الطلب (اختياري)
 * @property {string} group_by - التجميع حسب (supplier, month, category)
 * @property {boolean} include_items - تضمين تفاصيل العناصر
 * @property {string} format - تنسيق الملف (pdf, excel, json)
 */

export {};
