// backend/src/interfaces/types/common.types.js

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - نجاح العملية
 * @property {*} data - البيانات المرسلة
 * @property {string} message - رسالة توضيحية
 * @property {Object} errors - أخطاء التحقق من البيانات
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - رقم الصفحة
 * @property {number} limit - عدد العناصر في الصفحة
 * @property {string} sort - حقل الترتيب
 * @property {string} order - اتجاه الترتيب (asc/desc)
 */

/**
 * @typedef {Object} FilterParams
 * @property {string} search - نص البحث
 * @property {string} status - حالة التصفية
 * @property {string} date_from - تاريخ البداية
 * @property {string} date_to - تاريخ النهاية
 */

/**
 * @typedef {Object} User
 * @property {number} id - معرف المستخدم
 * @property {string} role - دور المستخدم
 * @property {number} pharmacy_id - معرف الصيدلية
 * @property {string} full_name - الاسم الكامل
 * @property {string} email - البريد الإلكتروني
 * @property {string} phone - رقم الهاتف
 */

/**
 * @typedef {Object} Medicine
 * @property {number} id - معرف الدواء
 * @property {string} name - اسم الدواء
 * @property {string} generic_name - الاسم العلمي
 * @property {string} form - شكل الدواء
 * @property {string} strength - تركيز الدواء
 * @property {string} barcode - الباركود
 * @property {number} price - السعر
 * @property {number} stock_qty - الكمية في المخزون
 * @property {number} category_id - معرف الفئة
 * @property {string} manufacturer - الشركة المصنعة
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {number} id - معرف أمر الشراء
 * @property {number} supplier_id - معرف المورد
 * @property {string} status - حالة الطلب
 * @property {string} order_date - تاريخ الطلب
 * @property {string} expected_date - تاريخ الاستلام المتوقع
 * @property {number} total - إجمالي المبلغ
 * @property {string} currency - العملة
 * @property {Array<PurchaseItem>} items - عناصر الطلب
 */

/**
 * @typedef {Object} PurchaseItem
 * @property {number} id - معرف العنصر
 * @property {string} name - اسم العنصر
 * @property {number} quantity - الكمية
 * @property {number} unit_price - سعر الوحدة
 * @property {number} line_total - إجمالي السطر
 * @property {string} batch_no - رقم الدفعة
 * @property {string} expiry_date - تاريخ الانتهاء
 */

/**
 * @typedef {Object} Sale
 * @property {number} id - معرف البيع
 * @property {string} sale_date - تاريخ البيع
 * @property {number} total - إجمالي المبلغ
 * @property {string} status - حالة البيع
 * @property {number} customer_id - معرف العميل
 * @property {Array<SaleItem>} items - عناصر البيع
 */

/**
 * @typedef {Object} SaleItem
 * @property {number} id - معرف العنصر
 * @property {number} medicine_id - معرف الدواء
 * @property {number} quantity - الكمية
 * @property {number} unit_price - سعر الوحدة
 * @property {number} line_total - إجمالي السطر
 */

/**
 * @typedef {Object} Customer
 * @property {number} id - معرف العميل
 * @property {string} full_name - الاسم الكامل
 * @property {string} phone - رقم الهاتف
 * @property {string} email - البريد الإلكتروني
 * @property {string} tax_number - الرقم الضريبي
 * @property {boolean} is_active - حالة التفعيل
 */

/**
 * @typedef {Object} Supplier
 * @property {number} id - معرف المورد
 * @property {string} name - اسم المورد
 * @property {string} phone - رقم الهاتف
 * @property {string} email - البريد الإلكتروني
 * @property {string} address - العنوان
 * @property {string} tax_number - الرقم الضريبي
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {number} id - معرف طريقة الدفع
 * @property {string} name - اسم طريقة الدفع
 * @property {boolean} is_cash - هل نقدية
 * @property {boolean} is_active - حالة التفعيل
 */

/**
 * @typedef {Object} InventoryMovement
 * @property {number} id - معرف الحركة
 * @property {number} medicine_id - معرف الدواء
 * @property {number} qty_change - التغيير في الكمية
 * @property {string} reason - سبب الحركة
 * @property {string} created_at - تاريخ الإنشاء
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} access_token - توكن الوصول
 * @property {string} refresh_token - توكن التحديث
 * @property {number} expires_in - مدة الصلاحية بالثواني
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - اسم الحقل
 * @property {string} message - رسالة الخطأ
 * @property {string} code - كود الخطأ
 */

/**
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - نجاح العملية
 * @property {*} data - البيانات
 * @property {string} message - الرسالة
 * @property {Array<ValidationError>} errors - أخطاء التحقق
 */

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} host - عنوان الخادم
 * @property {number} port - رقم المنفذ
 * @property {string} database - اسم قاعدة البيانات
 * @property {string} username - اسم المستخدم
 * @property {string} password - كلمة المرور
 * @property {Object} options - خيارات إضافية
 */

export {};
