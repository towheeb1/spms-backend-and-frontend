# 📁 البنية الكاملة للمشروع - SPMS Frontend

## 🌳 شجرة المشروع (محدثة)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                           # 💎 مكونات UI عامة
│   │   │   ├── Button.tsx                ✅ موجود
│   │   │   ├── Input.tsx                 ✅ موجود
│   │   │   ├── Card.tsx                  ✅ موجود
│   │   │   ├── Modal.tsx                 ✅ موجود
│   │   │   ├── Select.tsx                ✅ موجود
│   │   │   ├── Switch.tsx                ✅ موجود
│   │   │   ├── Toast.tsx                 ✅ موجود
│   │   │   ├── Loader.tsx                ✅ موجود
│   │   │   ├── FormField.tsx             ✅ موجود
│   │   │   ├── DataTable.tsx             ✅ موجود
│   │   │   ├── ConfirmDialog.tsx         ✅ موجود
│   │   │   ├── AuthLayout.tsx            ✅ موجود
│   │   │   ├── ThemeToggle.tsx           ✨ جديد
│   │   │   ├── BarcodeScanner.tsx        ✨ جديد
│   │   │   └── index.ts                  ✨ جديد (تصدير جماعي)
│   │   │
│   │   ├── pharmacist/                   # 💊 مكونات الصيدلي
│   │   │   ├── inventory/                # المخزون
│   │   │   │   ├── InventoryPage.tsx
│   │   │   │   ├── InventoryTable.tsx
│   │   │   │   ├── InventoryFilters.tsx
│   │   │   │   ├── InventoryStats.tsx
│   │   │   │   ├── InventoryAlerts.tsx
│   │   │   │   ├── InventoryBulkActions.tsx
│   │   │   │   ├── AddItemForm.tsx       ⚠️ يمكن تحديثه لاستخدام BarcodeScanner الجديد
│   │   │   │   ├── EditItemModal.tsx
│   │   │   │   └── types.ts              ⚠️ يمكن استبداله بـ types/medicine.ts
│   │   │   │
│   │   │   ├── medicines/                # الأدوية
│   │   │   │   ├── MedicinesPage.tsx     ⚠️ يستخدم IndexedDB - يحتاج تحديث
│   │   │   │   ├── MedicinesList.tsx
│   │   │   │   ├── MedicinesForm.tsx     ⚠️ يمكن تحديثه لاستخدام BarcodeScanner الجديد
│   │   │   │   ├── MedicinesFilters.tsx
│   │   │   │   ├── MedicinesStats.tsx
│   │   │   │   └── types.ts              ⚠️ يمكن استبداله بـ types/medicine.ts
│   │   │   │
│   │   │   ├── suppliers/                # الموردين
│   │   │   │   ├── SuppliersPage.tsx
│   │   │   │   ├── SuppliersTab.tsx
│   │   │   │   ├── PurchasesTab.tsx
│   │   │   │   ├── InventoryTab.tsx
│   │   │   │   ├── AddSupplierModal.tsx
│   │   │   │   ├── AddPurchaseModal.tsx
│   │   │   │   ├── EditSupplierModal.tsx
│   │   │   │   └── types.ts              ⚠️ يمكن استبداله بـ types/supplier.ts
│   │   │   │
│   │   │   ├── pharmacist-dashboard/     # لوحة تحكم الصيدلي
│   │   │   │   ├── KPIGrid.tsx
│   │   │   │   └── RecentMovements.tsx
│   │   │   │
│   │   │   └── SuppliersList.tsx
│   │   │
│   │   ├── doctor-componet/              # 👨‍⚕️ مكونات الطبيب
│   │   │   ├── doctor-dashboard/
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Donut.tsx
│   │   │   │   ├── KPIStat.tsx
│   │   │   │   ├── MiniBars.tsx
│   │   │   │   ├── MiniCalendar.tsx
│   │   │   │   ├── PatientsList.tsx
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   └── RecentPrescriptions.tsx
│   │   │   │
│   │   │   └── doctor-login/
│   │   │       ├── ClinicLocationForm.tsx
│   │   │       ├── DoctorAvatarUpload.tsx
│   │   │       ├── DoctorBasicInfoForm.tsx
│   │   │       ├── DoctorSpecialtiesPicker.tsx
│   │   │       ├── ExtraPharmaciesInput.tsx
│   │   │       ├── LoginControls.tsx
│   │   │       ├── NearbyPharmaciesSelector.tsx
│   │   │       ├── WorkSchedulePicker.tsx
│   │   │       ├── types.ts
│   │   │       └── useGeolocation.ts
│   │   │
│   │   ├── search/                       # 🔍 مكونات البحث
│   │   │   ├── FiltersPanel.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   │
│   │   ├── auth/                         # 🔐 مكونات المصادقة
│   │   │   └── RegisterPharmacistForm.tsx
│   │   │
│   │   └── Layout.tsx                    ⚠️ أفضل مكان لإضافة ThemeToggle
│   │
│   ├── pages/                            # 📄 الصفحات
│   │   ├── pharmacist/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Inventory.tsx             → يستورد InventoryPage
│   │   │   ├── Medicines.tsx             → يستورد MedicinesPage
│   │   │   ├── Suppliers.tsx             → يستورد SuppliersPage
│   │   │   ├── Profile.tsx
│   │   │   ├── PharmacistHome.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── doctors/
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── DoctorHome.tsx
│   │   │   ├── DoctorLayout.tsx
│   │   │   ├── DoctorConditions.tsx
│   │   │   ├── DoctorLabs.tsx
│   │   │   ├── DoctorNotifications.tsx
│   │   │   ├── DoctorPrescription.tsx
│   │   │   ├── DoctorPrescriptions.tsx
│   │   │   ├── DoctorVisits.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── patient/
│   │   │   ├── PatientHome.tsx
│   │   │   ├── PatientLayout.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Pharmacies.tsx
│   │   │   ├── Prescriptions.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── Addresses.tsx
│   │   │   ├── Insurance.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── index.ts
│   │   │   └── search-sources.ts
│   │   │
│   │   ├── loginPages/
│   │   │   ├── LoginDoctor.tsx
│   │   │   ├── LoginPatient.tsx
│   │   │   ├── LoginPharmacist.tsx
│   │   │   ├── LoginPharmacistPassword.tsx
│   │   │   ├── LoginPhone.tsx
│   │   │   ├── LoginSelect.tsx
│   │   │   └── RegisterPharmacist.tsx
│   │   │
│   │   ├── auth/
│   │   │   └── LoginPhoneBase.tsx
│   │   │
│   │   ├── POS.tsx                       ⚠️ يمكن استخدام BarcodeScanner هنا
│   │   ├── Users.tsx
│   │   ├── VerifyCode.tsx
│   │   └── NotFound.tsx
│   │
│   ├── services/                         # 🔌 خدمات API
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── doctorApi.ts
│   │   ├── doctorAuth.ts
│   │   ├── doctorDashboard.ts
│   │   ├── doctorProfile.ts
│   │   ├── inventory.ts
│   │   ├── medicines.ts
│   │   ├── pharmacist.ts
│   │   └── suppliers.ts
│   │
│   ├── hooks/                            # 🎣 Custom Hooks
│   │   ├── useBarcodeScanner.ts          ✨ جديد
│   │   └── index.ts                      ✨ جديد (تصدير جماعي)
│   │
│   ├── contexts/                         # 🌐 React Contexts
│   │   ├── ThemeContext.tsx              ✨ جديد
│   │   └── index.ts                      ✨ جديد (تصدير جماعي)
│   │
│   ├── types/                            # 📦 TypeScript Types
│   │   ├── medicine.ts                   ✨ جديد (موحد)
│   │   ├── supplier.ts                   ✨ جديد (موحد)
│   │   └── index.ts                      ✨ جديد (تصدير جماعي)
│   │
│   ├── store/                            # 🗃️ State Management
│   │   └── cart.ts
│   │
│   ├── approutrs/
│   │
│   ├── App.tsx                           ⚠️ أو main.tsx - أضف ThemeProvider هنا
│   ├── main.tsx                          ⚠️ أفضل مكان لـ ThemeProvider
│   ├── AppRoutes.tsx
│   ├── index.css
│   └── vite-env.d.ts
│
├── public/
│   └── logo.svg
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
│
├── NEW_COMPONENTS_GUIDE.md               ✨ دليل الاستخدام
├── IMPLEMENTATION_SUMMARY.md             ✨ ملخص التنفيذ
└── PROJECT_STRUCTURE.md                  ✨ هذا الملف
```

---

## 🎯 دليل سريع للمكونات

### 💎 UI Components (src/components/ui/)
مكونات عامة قابلة لإعادة الاستخدام في أي مكان

| المكون | الاستخدام | مثال |
|--------|----------|------|
| `Button` | أزرار التطبيق | `<Button>حفظ</Button>` |
| `Input` | حقول الإدخال | `<Input placeholder="..." />` |
| `ThemeToggle` | زر الوضع الليلي/النهاري | `<ThemeToggle variant="icon" />` |
| `BarcodeScanner` | مسح الباركود | `<BarcodeScanner onScan={...} />` |
| `Modal` | نوافذ منبثقة | `<Modal title="..." />` |
| `Toast` | إشعارات | `toast.success('تم الحفظ')` |

---

### 💊 Pharmacist Components (src/components/pharmacist/)
مكونات خاصة بصفحات الصيدلي

```
pharmacist/
├── inventory/       → إدارة المخزون
├── medicines/       → إدارة الأدوية
├── suppliers/       → إدارة الموردين
└── pharmacist-dashboard/ → لوحة التحكم
```

**كل مجلد يحتوي على:**
- `*Page.tsx` - المكون الرئيسي (Container)
- `*Table.tsx` أو `*List.tsx` - عرض البيانات
- `*Form.tsx` - نماذج الإضافة/التعديل
- `*Filters.tsx` - التصفية والبحث
- `*Stats.tsx` - الإحصائيات
- `types.ts` - الأنواع الخاصة

---

### 🎣 Hooks (src/hooks/)
Custom React Hooks قابلة لإعادة الاستخدام

```tsx
// مثال: useBarcodeScanner
import { useBarcodeScanner } from '@/hooks';

const { scanning, startScan, stopScan } = useBarcodeScanner({
  onScan: (code) => console.log(code),
  hashBarcode: true
});
```

---

### 🌐 Contexts (src/contexts/)
React Contexts لإدارة الحالة العامة

```tsx
// مثال: ThemeContext
import { ThemeProvider, useTheme } from '@/contexts';

// في App.tsx
<ThemeProvider>
  <App />
</ThemeProvider>

// في أي مكون
const { theme, toggleTheme } = useTheme();
```

---

### 📦 Types (src/types/)
TypeScript Types موحدة

```tsx
// استيراد سهل
import { Medicine, Supplier, Purchase } from '@/types';

// أو محدد
import { Medicine } from '@/types/medicine';
import { Supplier } from '@/types/supplier';
```

---

## 🔄 علاقات المكونات

### تدفق Inventory:
```
pages/pharmacist/Inventory.tsx
    ↓
components/pharmacist/inventory/InventoryPage.tsx
    ↓
    ├── InventoryStats
    ├── InventoryFilters
    ├── InventoryTable
    ├── InventoryAlerts
    ├── InventoryBulkActions
    └── AddItemForm
        ↓
        └── BarcodeScanner (جديد) ✨
```

### تدفق Medicines:
```
pages/pharmacist/Medicines.tsx
    ↓
components/pharmacist/medicines/MedicinesPage.tsx
    ↓
    ├── MedicinesFilters
    ├── MedicinesForm
    │   ↓
    │   └── BarcodeScanner (جديد) ✨
    ├── MedicinesList
    └── MedicinesStats
```

### تدفق Theme:
```
main.tsx
    ↓
<ThemeProvider> ✨
    ↓
    ├── Layout.tsx
    │   ↓
    │   └── <ThemeToggle /> ✨
    │
    └── باقي التطبيق
```

---

## 📝 خريطة التحديثات المقترحة

### ⚠️ ملفات تحتاج تحديث (اختياري):

1. **src/main.tsx** أو **src/App.tsx**
   - إضافة `<ThemeProvider>`
   - ⏱️ 2 دقيقة

2. **src/components/Layout.tsx**
   - إضافة `<ThemeToggle />`
   - ⏱️ 1 دقيقة

3. **src/components/pharmacist/inventory/AddItemForm.tsx**
   - استبدال BarcodeScanner القديم بالجديد
   - ⏱️ 5 دقائق

4. **src/components/pharmacist/medicines/MedicinesForm.tsx**
   - استبدال BarcodeScanner القديم بالجديد
   - ⏱️ 5 دقائق

5. **src/components/pharmacist/medicines/MedicinesPage.tsx**
   - تحويل من IndexedDB إلى Backend API
   - ⏱️ 15 دقيقة

6. **src/pages/POS.tsx**
   - إضافة `<BarcodeScanner />` للمنتجات
   - ⏱️ 10 دقائق

**إجمالي الوقت:** ~40 دقيقة (كلها اختيارية)

---

## ✅ الملفات الجاهزة (لا تحتاج تعديل)

- ✅ جميع ملفات `src/hooks/`
- ✅ جميع ملفات `src/contexts/`
- ✅ جميع ملفات `src/types/`
- ✅ `src/components/ui/ThemeToggle.tsx`
- ✅ `src/components/ui/BarcodeScanner.tsx`
- ✅ جميع ملفات `index.ts` (barrel exports)

---

## 🎨 استيراد سهل (Barrel Exports)

بفضل ملفات `index.ts` الجديدة:

```tsx
// ❌ القديم (طويل)
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal } from './components/ui/Modal';

// ✅ الجديد (قصير)
import { Button, Input, Modal } from './components/ui';
```

```tsx
// ❌ القديم
import { useBarcodeScanner } from './hooks/useBarcodeScanner';

// ✅ الجديد
import { useBarcodeScanner } from './hooks';
```

```tsx
// ❌ القديم
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';

// ✅ الجديد
import { ThemeProvider, useTheme } from './contexts';
```

---

## 🚀 البدء السريع (3 خطوات)

### 1️⃣ تفعيل الثيم
```tsx
// في src/main.tsx
import { ThemeProvider } from './contexts';

root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
```

### 2️⃣ إضافة زر الثيم
```tsx
// في src/components/Layout.tsx
import { ThemeToggle } from './ui';

<header>
  <ThemeToggle variant="icon" />
</header>
```

### 3️⃣ استخدام BarcodeScanner
```tsx
// في أي نموذج
import { BarcodeScanner } from './components/ui';

{showScanner && (
  <BarcodeScanner
    onScan={(code) => setBarcode(code)}
    onClose={() => setShowScanner(false)}
  />
)}
```

---

## 📊 مقارنة قبل وبعد

| الميزة | قبل | بعد |
|--------|-----|-----|
| **Barcode Scanner** | مكرر في 3 أماكن | مكون واحد مشترك ✨ |
| **Types** | ملفات منفصلة غير متوافقة | ملف موحد ✨ |
| **Theme** | غير موجود | Dark/Light mode ✨ |
| **استيراد المكونات** | طويل ومكرر | قصير وواضح ✨ |
| **صيانة الكود** | صعبة | سهلة جداً ✨ |

---

## 🎯 الخلاصة

✅ **جميع الملفات الجديدة جاهزة**  
✅ **لم نعدل أي ملف قديم**  
✅ **Backend آمن تماماً**  
✅ **التنسيق لم يتأثر**  
✅ **يمكن الاستخدام فوراً**

**📂 المشروع الآن أكثر احترافية وسهل الصيانة! 🎉**
