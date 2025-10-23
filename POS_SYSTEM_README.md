# نظام المبيعات والأرباح المتكامل

## المميزات الجديدة

### ✅ **نظام المبيعات المحسن**
- **ترحيل المبيعات** مع تحديث المخزون تلقائياً
- **حفظ المسودات** للمبيعات غير المكتملة
- **نظام المدفوعات** المتعدد (نقدي، بطاقة، تحويل بنكي، آجل)
- **تتبع العملاء** مع إمكانية البحث والفلترة
- **إدارة الورديات** وصناديق النقود

### ✅ **نظام إدارة المخزون**
- **تحديث تلقائي** للمخزون عند البيع
- **تتبع حركات المخزون** مع تفاصيل كاملة
- **ربط الأسعار** من أوامر الشراء للأدوية
- **حساب التكلفة والربح** لكل صنف

### ✅ **نظام الأرباح والتقارير**
- **تقرير الأرباح** الشامل مع هامش الربح
- **تحليل المبيعات** حسب الفرع والفترة الزمنية
- **أكثر الأدوية ربحية** مع التفاصيل الكاملة
- **إحصائيات شاملة** للمبيعات والأرباح

## التدفق المحسن للبيع

### 1. **إنشاء المبيعة**
```typescript
// في POSPage.tsx
const handlePostSale = async (cart: CartItem[], customerId: number | null) => {
  const result = await onPostSale(cart, selectedCustomerId);

  // إنشاء كائن POSReceipt من النتيجة
  const receipt: POSReceipt = {
    id: result.invoice.id,
    invoice: result.invoice,
    items: [], // سيتم تعبئتها لاحقاً عند الحاجة
    payments: result.payments
  };

  setCurrentReceipt(receipt);
  setShowPaymentModal(true);
};
```

### 2. **تحديث المخزون**
```sql
-- تحديث كمية المخزون (للمبيعات المؤكدة فقط)
UPDATE medicines
SET stock_qty = GREATEST(stock_qty - ?, 0)
WHERE id = ? AND pharmacy_id = ?

-- إضافة حركة مخزون للبيع
INSERT INTO inventory_movements (
  medicine_id, branch_id, sale_id, qty_change, reason, ref_type, ref_id, pharmacy_id
) VALUES (?, ?, ?, ?, 'sale', 'SO', ?, ?)
```

### 3. **حساب الأرباح**
```sql
-- حساب الربح لكل صنف
SELECT
  m.name,
  SUM(si.qty) as total_qty,
  SUM(si.line_total) as total_revenue,
  SUM(si.qty * poi.unit_price) as total_cost,
  SUM(si.line_total - (si.qty * poi.unit_price)) as total_profit
FROM sale_items si
JOIN medicines m ON m.id = si.medicine_id
LEFT JOIN purchase_order_items poi ON poi.medicine_id = si.medicine_id
GROUP BY m.id, m.name
```

## API Endpoints الجديدة

### المبيعات
- `POST /sales` - إنشاء مبيعة جديدة
- `POST /sales/drafts` - إنشاء مسودة مبيعة
- `GET /sales` - قائمة المبيعات مع الفلترة
- `GET /sales/:id` - تفاصيل مبيعة مع العناصر والمدفوعات
- `POST /sales/:id/payments` - إضافة دفعة لمبيعة

### التقارير
- `GET /reports/sales` - تقرير المبيعات
- `GET /reports/profit` - تقرير الأرباح

## الجداول المحدثة

### sales
```sql
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS pharmacy_id INT NULL,
  ADD COLUMN IF NOT EXISTS branch_id INT NULL,
  ADD COLUMN IF NOT EXISTS register_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS shift_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS customer_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('draft','posted','void','returned') DEFAULT 'posted';
```

### sale_items
```sql
ALTER TABLE sale_items
  ADD COLUMN IF NOT EXISTS pharmacy_id INT NULL,
  ADD COLUMN IF NOT EXISTS branch_id INT NULL;
```

### inventory_movements
```sql
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS branch_id INT NULL,
  ADD COLUMN IF NOT EXISTS sale_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS po_id BIGINT NULL;
```

## التحسينات المضافة

### 1. **مزامنة الأسعار**
- ربط الأسعار المحسوبة من أوامر الشراء مع جدول الأدوية
- تحديث الأسعار عند استلام البضاعة
- عرض جميع أنواع الأسعار (تجزئة، شريط، حبة، كرتون، جملة)

### 2. **نظام المدفوعات**
- دعم طرق دفع متعددة
- تتبع المدفوعات والمبالغ المستلمة
- إمكانية الدفع الجزئي والتقسيط

### 3. **التقارير المتقدمة**
- تقارير تفصيلية للمبيعات والأرباح
- تحليل الأداء حسب الفرع والفترة
- مؤشرات الأداء الرئيسية (KPIs)

## كيفية الاستخدام

### 1. **إنشاء مبيعة**
1. أضف الأدوية إلى السلة
2. اختر العميل (اختياري)
3. اضغط "ترحيل البيع"
4. اختر طريقة الدفع
5. أكد المبيعة

### 2. **عرض التقارير**
1. اذهب إلى "التقارير والإحصائيات"
2. اختر نوع التقرير (مبيعات أو أرباح)
3. حدد الفترة الزمنية والفرع (اختياري)
4. اضغط "عرض التقرير"

### 3. **إدارة المخزون**
- يتم تحديث المخزون تلقائياً عند كل مبيعة
- يمكن متابعة حركات المخزون من قسم المخزون
- ربط الأسعار بالمخزون من أوامر الشراء

## ملاحظات مهمة

- **الأسعار المحسوبة** تُربط تلقائياً من أحدث أمر شراء لكل دواء
- **حركات المخزون** تُسجل لكل عملية بيع أو شراء
- **الأرباح** تُحسب بناءً على تكلفة الشراء وسعر البيع
- **التقارير** قابلة للتصفية حسب الفترة الزمنية والفرع

## استكشاف الأخطاء

إذا لم تظهر الأسعار:
1. تأكد من استلام البضاعة من أوامر الشراء
2. تحقق من ربط الأدوية بالـ purchase_order_items
3. تأكد من تحديث المخزون عند الاستلام

إذا لم يعمل البيع:
1. تحقق من صحة البيانات في السلة
2. تأكد من وجود مخزون كافي
3. تحقق من صلاحيات المستخدم
