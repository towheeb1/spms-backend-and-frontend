# وظيفة استلام أمر شراء (Receive Purchase Order)

## نظرة عامة
تم تطوير نظام شامل لاستلام أوامر الشراء في نظام إدارة الصيدلية، يتضمن إدارة المخزون وحركات المخزون والتحقق من البيانات.

## المميزات الرئيسية

### ✅ **الخلفية (Backend)**
- **API Endpoint**: `POST /api/purchases/:poId/receive`
- **معالجة معاملات آمنة** باستخدام Sequelize transactions
- **تحقق من الصيدلية** - التأكد من أن أمر الشراء ينتمي للصيدلية الحالية
- **التحقق من الكميات** - عدم السماح باستلام كميات أكبر من المطلوبة
- **إدارة المخزون** - تحديث أو إنشاء الأدوية في جدول medicines
- **تسجيل الحركات** - تتبع حركات المخزون في جدول inventory_movements
- **تحديث الحالة** - تغيير حالة أمر الشراء من "ordered" إلى "received"

### ✅ **الواجهة الأمامية (Frontend)**
- **دالة خدمة**: `receivePurchaseOrder(purchaseOrderId, items)`
- **مكون تفاعلي**: `ReceivePurchaseModal` لاستلام أمر الشراء
- **التحقق من البيانات** - التحقق من صحة الكميات قبل الإرسال
- **تجربة مستخدم محسنة** - عرض معلومات واضحة وتفاعل سلس

## كيفية الاستخدام

### 1. استدعاء الـ API من الخلفية

```javascript
// POST /api/purchases/:poId/receive
{
  "items": [
    {
      "purchase_item_id": 1,
      "received_qty": 50,
      "batch_no": "BATCH001",
      "expiry_date": "2024-12-31"
    },
    {
      "purchase_item_id": 2,
      "received_qty": 30,
      "batch_no": "BATCH002",
      "expiry_date": "2024-11-30"
    }
  ]
}
```

### 2. استخدام الدالة في الواجهة الأمامية

```tsx
import { receivePurchaseOrder } from '../../../services/suppliers';
import ReceivePurchaseModal from '../../../components/pharmacist/purchases/ReceivePurchaseModal';

// في المكون الرئيسي
const handleReceivePurchase = async (purchaseOrderId: number, items: ReceivePurchaseItem[]) => {
  try {
    const result = await receivePurchaseOrder(purchaseOrderId, items);

    if (result.success) {
      alert(result.message);
      // إعادة تحميل البيانات أو إغلاق المودال
      onSuccess();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error receiving purchase:', error);
  }
};

// استخدام المودال
<ReceivePurchaseModal
  purchaseOrder={purchaseOrder}
  purchaseItems={purchaseItems}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // إعادة تحميل البيانات
    refetchPurchases();
    setShowModal(false);
  }}
/>
```

## بنية قاعدة البيانات

### جدول `purchases`
```sql
ALTER TABLE purchases ADD COLUMN pharmacy_id INT NOT NULL;
ALTER TABLE purchases ADD COLUMN status ENUM('draft', 'ordered', 'received', 'cancelled') DEFAULT 'draft';
```

### جدول `purchase_items`
```sql
ALTER TABLE purchase_items ADD COLUMN medicine_id INT REFERENCES medicines(id);
ALTER TABLE purchase_items ADD COLUMN received_qty DECIMAL(10, 2) DEFAULT 0;
```

### جدول `medicines` (جديد)
```sql
CREATE TABLE medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  price DECIMAL(12, 4) NOT NULL,
  stock_qty DECIMAL(10, 2) DEFAULT 0,
  pharmacy_id INT NOT NULL,
  -- باقي الحقول
);
```

### جدول `inventory_movements` (جديد)
```sql
CREATE TABLE inventory_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  type ENUM('in', 'out', 'adjustment', 'expiry', 'damage') NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255),
  pharmacist_id INT NOT NULL,
  pharmacy_id INT NOT NULL,
  -- باقي الحقول
);
```

## الأمان والتحقق

### ✅ **التحقق من الصيدلية**
- التأكد من أن `req.user.pharmacy_id` موجود
- التحقق من أن أمر الشراء ينتمي للصيدلية الحالية

### ✅ **التحقق من الكميات**
- عدم السماح باستلام كميات أكبر من المطلوبة
- التحقق من وجود عناصر أمر الشراء

### ✅ **معالجة المعاملات**
- استخدام Sequelize transactions لضمان الأمان
- rollback في حالة حدوث أي خطأ

## الاستجابات

### نجاح الاستلام
```json
{
  "success": true,
  "message": "تم استلام أمر الشراء بالكامل",
  "purchase": {
    "id": 123,
    "status": "received",
    "received_items": 2
  }
}
```

### فشل الاستلام
```json
{
  "success": false,
  "message": "فشل في استلام أمر الشراء",
  "error": "تفاصيل الخطأ"
}
```

## ملاحظات مهمة

1. **تأكد من وجود الصيدلية** - يجب أن يكون `req.user.pharmacy_id` محدد في middleware المصادقة
2. **تأكد من حالة أمر الشراء** - يجب أن يكون في حالة "ordered" للاستلام
3. **تأكد من وجود الجداول** - قم بتشغيل migrations لإنشاء الجداول الجديدة
4. **تأكد من العلاقات** - تأكد من أن العلاقات بين الجداول محددة بشكل صحيح

## مثال كامل للاستخدام

```javascript
// في الخادم - إضافة الـ route
router.post('/:poId/receive', receivePurchaseOrder);

// في الواجهة - استدعاء الدالة
const result = await receivePurchaseOrder(123, [
  {
    purchase_item_id: 1,
    received_qty: 50,
    batch_no: "BATCH001",
    expiry_date: "2024-12-31"
  }
]);
```

هذا النظام يوفر إدارة شاملة وآمنة لاستلام أوامر الشراء مع تتبع كامل للمخزون وحركاته! 🚀
