// backend/src/interfaces/types/sales.types.js

/**
 * @typedef {Object} SaleData
 * @property {number} customer_id - معرف العميل (اختياري)
 * @property {Array<SaleItemData>} items - عناصر البيع
 * @property {string} notes - ملاحظات البيع
 * @property {number} branch_id - معرف الفرع
 * @property {number} register_id - معرف الكاشير
 * @property {number} shift_id - معرف الوردية
 * @property {string} sale_date - تاريخ البيع
 * @property {string} status - حالة البيع (draft, posted, void, returned)
 */

/**
 * @typedef {Object} SaleItemData
 * @property {number} medicine_id - معرف الدواء
 * @property {number} quantity - الكمية المباعة
 * @property {number} unit_price - سعر الوحدة
 * @property {number} discount_amount - مبلغ الخصم
 * @property {number} discount_percent - نسبة الخصم
 * @property {number} line_total - إجمالي السطر
 * @property {string} notes - ملاحظات العنصر
 */

/**
 * @typedef {Object} SalePaymentData
 * @property {number} sale_id - معرف البيع
 * @property {number} method_id - معرف طريقة الدفع
 * @property {number} amount - مبلغ الدفع
 * @property {boolean} is_change - هل هو باقي النقود
 * @property {string} reference - مرجع الدفع
 * @property {string} notes - ملاحظات الدفع
 */

/**
 * @typedef {Object} SaleReceipt
 * @property {number} id - معرف الإيصال
 * @property {SaleData} sale - بيانات البيع
 * @property {Array<SaleItemData>} items - عناصر البيع
 * @property {Array<SalePaymentData>} payments - المدفوعات
 * @property {number} total_paid - إجمالي المدفوعات
 * @property {number} change_amount - مبلغ الباقي
 * @property {string} printed_at - تاريخ الطباعة
 */

/**
 * @typedef {Object} POSShift
 * @property {number} id - معرف الوردية
 * @property {number} register_id - معرف الكاشير
 * @property {number} opened_by - معرف الصيدلي الذي فتح الوردية
 * @property {number} closed_by - معرف الصيدلي الذي أغلق الوردية
 * @property {string} opened_at - تاريخ فتح الوردية
 * @property {string} closed_at - تاريخ إغلاق الوردية
 * @property {number} opening_float - النقود الأولية في الكاشير
 * @property {number} expected_amount - المبلغ المتوقع في نهاية الوردية
 * @property {number} closing_amount - المبلغ الفعلي في نهاية الوردية
 * @property {string} notes - ملاحظات الوردية
 */

/**
 * @typedef {Object} POSRegister
 * @property {number} id - معرف الكاشير
 * @property {string} name - اسم الكاشير
 * @property {number} branch_id - معرف الفرع
 * @property {boolean} is_active - حالة التفعيل
 * @property {string} created_at - تاريخ الإنشاء
 */

/**
 * @typedef {Object} SalesAnalytics
 * @property {number} total_sales - إجمالي المبيعات
 * @property {number} total_transactions - إجمالي المعاملات
 * @property {number} average_sale - متوسط المبيعة
 * @property {number} total_discounts - إجمالي الخصومات
 * @property {number} total_returns - إجمالي المرتجعات
 * @property {number} net_revenue - صافي الإيرادات
 * @property {Array<PaymentMethodStats>} payment_methods - إحصائيات طرق الدفع
 * @property {Array<SalesTrend>} trends - اتجاهات المبيعات
 * @property {Array<TopMedicine>} top_medicines - أكثر الأدوية مبيعاً
 */

/**
 * @typedef {Object} PaymentMethodStats
 * @property {number} method_id - معرف طريقة الدفع
 * @property {string} method_name - اسم طريقة الدفع
 * @property {number} transaction_count - عدد المعاملات
 * @property {number} total_amount - إجمالي المبلغ
 * @property {number} percentage - النسبة المئوية
 */

/**
 * @typedef {Object} SalesTrend
 * @property {string} period - الفترة (YYYY-MM-DD)
 * @property {number} sales_count - عدد المبيعات
 * @property {number} total_amount - إجمالي المبلغ
 * @property {number} average_amount - متوسط المبلغ
 */

/**
 * @typedef {Object} TopMedicine
 * @property {number} medicine_id - معرف الدواء
 * @property {string} medicine_name - اسم الدواء
 * @property {number} quantity_sold - الكمية المباعة
 * @property {number} revenue - الإيرادات
 * @property {number} profit - الربح
 */

/**
 * @typedef {Object} SalesFilter
 * @property {string} date_from - تاريخ البداية
 * @property {string} date_to - تاريخ النهاية
 * @property {number} customer_id - معرف العميل
 * @property {number} branch_id - معرف الفرع
 * @property {number} register_id - معرف الكاشير
 * @property {number} shift_id - معرف الوردية
 * @property {string} status - حالة البيع
 * @property {number} min_amount - الحد الأدنى للمبلغ
 * @property {number} max_amount - الحد الأقصى للمبلغ
 * @property {string} payment_method - طريقة الدفع
 */

/**
 * @typedef {Object} SalesReport
 * @property {string} report_type - نوع التقرير (daily, weekly, monthly)
 * @property {string} date_from - تاريخ البداية
 * @property {string} date_to - تاريخ النهاية
 * @property {number} branch_id - معرف الفرع (اختياري)
 * @property {string} group_by - التجميع حسب (date, medicine, customer)
 * @property {boolean} include_details - تضمين التفاصيل
 * @property {string} format - تنسيق الملف (pdf, excel, json)
 */

export {};
