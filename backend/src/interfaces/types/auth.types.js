// backend/src/interfaces/types/auth.types.js

/**
 * @typedef {Object} LoginCredentials
 * @property {string} emailOrUsername - البريد الإلكتروني أو اسم المستخدم
 * @property {string} password - كلمة المرور
 * @property {boolean} rememberMe - تذكر تسجيل الدخول
 */

/**
 * @typedef {Object} OtpRequest
 * @property {string} name - اسم المستخدم
 * @property {string} phone - رقم الهاتف
 */

/**
 * @typedef {Object} OtpVerification
 * @property {string} phone - رقم الهاتف
 * @property {string} code - رمز التحقق
 */

/**
 * @typedef {Object} RegistrationData
 * @property {string} full_name - الاسم الكامل
 * @property {string} email - البريد الإلكتروني
 * @property {string} username - اسم المستخدم
 * @property {string} password - كلمة المرور
 * @property {string} phone - رقم الهاتف
 * @property {string} title - المسمى الوظيفي
 * @property {string} license_no - رقم الترخيص
 * @property {string} license_expiry - تاريخ انتهاء الترخيص
 * @property {string} accreditation_body - جهة الاعتماد
 * @property {string} pharmacy_display_name - اسم الصيدلية
 * @property {number} branches_count - عدد الفروع
 * @property {string} address_line1 - عنوان السطر الأول
 * @property {string} address_line2 - عنوان السطر الثاني
 * @property {string} city - المدينة
 * @property {string} state - الولاية/المحافظة
 * @property {string} country - الدولة
 * @property {string} timezone - المنطقة الزمنية
 * @property {string} locale - اللغة المحلية
 */

/**
 * @typedef {Object} TokenPayload
 * @property {number} sub - معرف المستخدم
 * @property {string} role - دور المستخدم
 * @property {number} pharmacy_id - معرف الصيدلية
 * @property {number} iat - تاريخ الإصدار
 * @property {number} exp - تاريخ الانتهاء
 */

/**
 * @typedef {Object} RefreshTokenData
 * @property {number} id - معرف التوكن
 * @property {number} user_id - معرف المستخدم
 * @property {string} role - دور المستخدم
 * @property {string} token_hash - هاش التوكن
 * @property {string} expires_at - تاريخ الانتهاء
 * @property {boolean} revoked - هل تم إلغاؤه
 * @property {string} created_at - تاريخ الإنشاء
 */

/**
 * @typedef {Object} PharmacistProfile
 * @property {number} id - معرف الصيدلي
 * @property {string} full_name - الاسم الكامل
 * @property {string} email - البريد الإلكتروني
 * @property {string} username - اسم المستخدم
 * @property {string} phone - رقم الهاتف
 * @property {string} title - المسمى الوظيفي
 * @property {string} license_no - رقم الترخيص
 * @property {string} license_expiry - تاريخ انتهاء الترخيص
 * @property {string} accreditation_body - جهة الاعتماد
 * @property {Object} pharmacy - بيانات الصيدلية
 * @property {string} timezone - المنطقة الزمنية
 * @property {string} locale - اللغة المحلية
 * @property {string} avatar_url - رابط الصورة الرمزية
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} access_token - توكن الوصول
 * @property {string} refresh_token - توكن التحديث
 * @property {string} token_type - نوع التوكن
 * @property {number} expires_in - مدة الصلاحية بالثواني
 * @property {string} scope - نطاق التوكن
 */

export {};
