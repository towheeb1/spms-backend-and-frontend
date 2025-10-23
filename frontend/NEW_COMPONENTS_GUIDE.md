# 📚 دليل المكونات الجديدة - SPMS

## 📦 المكونات التي تم إضافتها

### 1. 🎨 مكون الوضع الليلي/النهاري (Theme Toggle)

#### الملفات:
- `src/contexts/ThemeContext.tsx` - Context للإدارة العامة
- `src/components/ui/ThemeToggle.tsx` - زر التبديل

#### كيفية الاستخدام:

##### الخطوة 1: تغليف التطبيق بـ ThemeProvider

```tsx
// في src/main.tsx أو src/App.tsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* باقي التطبيق */}
    </ThemeProvider>
  );
}
```

##### الخطوة 2: استخدام زر التبديل

```tsx
import { ThemeToggle } from './components/ui/ThemeToggle';

// في أي مكون (Header, Sidebar, etc.)
function Header() {
  return (
    <header>
      {/* محتوى الـ Header */}
      
      {/* أيقونة فقط */}
      <ThemeToggle variant="icon" />
      
      {/* أو زر مع نص */}
      <ThemeToggle variant="button" showLabel />
      
      {/* أو Switch */}
      <ThemeToggle variant="switch" showLabel />
    </header>
  );
}
```

##### الخطوة 3: استخدام الثيم في مكون مخصص

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>الثيم الحالي: {theme}</p>
      <button onClick={toggleTheme}>تبديل</button>
      <button onClick={() => setTheme('dark')}>وضع ليلي</button>
      <button onClick={() => setTheme('light')}>وضع نهاري</button>
    </div>
  );
}
```

#### الألوان المدعومة في CSS:

يتم تطبيق الثيم تلقائياً على `<html class="dark">` أو `<html class="light">`

يمكنك استخدام Tailwind classes مثل:
```css
/* تلقائياً يتغير حسب الثيم */
bg-white dark:bg-gray-900
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700
```

---

### 2. 📷 مكون مسح الباركود (Barcode Scanner)

#### الملفات:
- `src/hooks/useBarcodeScanner.ts` - Hook للمنطق
- `src/components/ui/BarcodeScanner.tsx` - واجهة المستخدم

#### كيفية الاستخدام:

##### طريقة 1: استخدام المكون الجاهز (الأسهل)

```tsx
import { useState } from 'react';
import { BarcodeScanner } from './components/ui/BarcodeScanner';

function MyForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [barcode, setBarcode] = useState('');

  const handleScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    console.log('تم مسح الباركود:', scannedBarcode);
  };

  return (
    <div>
      <input 
        type="text" 
        value={barcode} 
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="الباركود"
      />
      
      <button onClick={() => setShowScanner(true)}>
        📷 مسح الباركود
      </button>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          hashBarcode={true} // تشفير SHA-256
          title="مسح باركود الدواء"
        />
      )}
    </div>
  );
}
```

##### طريقة 2: استخدام الـ Hook مباشرة (للتخصيص المتقدم)

```tsx
import { useBarcodeScanner } from './hooks/useBarcodeScanner';

function CustomScanner() {
  const { scanning, error, startScan, stopScan } = useBarcodeScanner({
    onScan: (barcode) => {
      console.log('Scanned:', barcode);
      alert(`الباركود: ${barcode}`);
    },
    onError: (err) => console.error(err),
    hashBarcode: false // بدون تشفير
  });

  return (
    <div>
      <video id="my-video" />
      
      {!scanning ? (
        <button onClick={() => startScan('my-video')}>بدء المسح</button>
      ) : (
        <button onClick={stopScan}>إيقاف</button>
      )}
      
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

#### خيارات البركود:
- `hashBarcode: true` - تشفير الباركود بـ SHA-256 (مفيد للأمان)
- `hashBarcode: false` - إرجاع الباركود كما هو

#### الباركودات المدعومة:
- QR Code
- Code 128
- EAN-13
- EAN-8
- UPC-A
- UPC-E

---

### 3. 📋 Shared Types (أنواع موحدة)

#### الملفات:
- `src/types/medicine.ts` - أنواع الأدوية
- `src/types/supplier.ts` - أنواع الموردين
- `src/types/index.ts` - تجميع

#### كيفية الاستخدام:

```tsx
// استيراد الأنواع
import { Medicine, MedicineSortBy, MedicineStatusFilter } from '@/types/medicine';
import { Supplier, Purchase, PurchaseItem } from '@/types/supplier';

// أو استيراد الكل
import { Medicine, Supplier, Purchase } from '@/types';

// مثال: استخدام في State
const [medicines, setMedicines] = useState<Medicine[]>([]);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);

// مثال: دالة typed
function addMedicine(medicine: Medicine): void {
  // ...
}

// مثال: DTO للإرسال إلى Backend
import { MedicineCreateDTO } from '@/types/medicine';

const newMedicine: MedicineCreateDTO = {
  name: 'باراسيتامول',
  price: 15.50,
  stock_qty: 100
};

await api.post('/medicines', newMedicine);
```

---

## 🎯 أمثلة تطبيقية

### مثال 1: إضافة دواء مع مسح الباركود

```tsx
import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import { Medicine } from '@/types/medicine';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function AddMedicineForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [medicine, setMedicine] = useState<Partial<Medicine>>({
    trade_name: '',
    price: 0,
    barcode: ''
  });

  const handleScan = (barcode: string) => {
    setMedicine(prev => ({ ...prev, barcode }));
  };

  const handleSubmit = async () => {
    await api.post('/medicines', medicine);
  };

  return (
    <form>
      <Input 
        placeholder="اسم الدواء"
        value={medicine.trade_name}
        onChange={(e) => setMedicine(prev => ({ 
          ...prev, 
          trade_name: e.target.value 
        }))}
      />

      <div className="relative">
        <Input 
          placeholder="الباركود"
          value={medicine.barcode}
          onChange={(e) => setMedicine(prev => ({ 
            ...prev, 
            barcode: e.target.value 
          }))}
        />
        <button 
          type="button"
          onClick={() => setShowScanner(true)}
          className="absolute left-2 top-1/2 -translate-y-1/2"
        >
          📷
        </button>
      </div>

      <Button onClick={handleSubmit}>إضافة الدواء</Button>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          hashBarcode={true}
        />
      )}
    </form>
  );
}
```

### مثال 2: Header مع Theme Toggle

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          نظام الصيدلية الذكي
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* إشعارات */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          🔔
        </button>

        {/* Theme Toggle */}
        <ThemeToggle variant="icon" />

        {/* User Menu */}
        <button className="flex items-center gap-2">
          <img src="/avatar.png" className="w-8 h-8 rounded-full" />
        </button>
      </div>
    </header>
  );
}
```

---

## 🔧 ملاحظات تقنية

### المتطلبات:
- **React 18+**
- **TypeScript**
- **Tailwind CSS** (للثيم)
- **Browser Support:** Chrome 83+, Edge 83+, Safari 14+ (لـ Barcode Detector API)

### الأداء:
- ✅ Theme يُحفظ في `localStorage`
- ✅ Barcode Scanner يستخدم `requestAnimationFrame` للأداء الأمثل
- ✅ جميع المكونات مكتوبة بـ TypeScript للأمان

### الأمان:
- ✅ يمكن تشفير الباركود بـ SHA-256
- ✅ Theme لا يؤثر على الأمان
- ✅ Camera permissions تُطلب فقط عند الحاجة

---

## 📝 TODO (المهام القادمة)

### المرحلة القادمة:
- [ ] إصلاح Medicines Module ليستخدم Backend API بدلاً من IndexedDB
- [ ] دمج BarcodeScanner في AddItemForm و MedicinesForm
- [ ] إنشاء DataTable component قابل لإعادة الاستخدام
- [ ] إضافة Theme CSS variables للتخصيص المتقدم

---

## 🎨 Customization

### تخصيص ألوان الثيم:

```css
/* في tailwind.config.js */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ألوان مخصصة للوضع الليلي
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f1f5f9'
        },
        light: {
          bg: '#ffffff',
          card: '#f8fafc',
          text: '#0f172a'
        }
      }
    }
  }
}
```

### تخصيص BarcodeScanner:

```tsx
// تغيير الألوان والأنماط
<BarcodeScanner
  onScan={handleScan}
  onClose={() => setShowScanner(false)}
  // يمكنك تعديل الـ classes في المكون مباشرة
/>
```

---

## ❓ الأسئلة الشائعة

### س: هل يجب استبدال الكود القديم؟
**ج:** لا! هذه مكونات جديدة تُضاف بجانب الموجود. استخدمها في الصفحات الجديدة أو عند التحديث.

### س: كيف أستخدم Theme في الـ pages القديمة؟
**ج:** فقط غلّف `<App>` بـ `<ThemeProvider>` وسيعمل تلقائياً.

### س: هل BarcodeScanner يعمل على الموبايل؟
**ج:** نعم! يستخدم `facingMode: 'environment'` للكاميرا الخلفية.

### س: ماذا لو المتصفح لا يدعم Barcode Detector API؟
**ج:** سيظهر خطأ واضح. يمكن إضافة Polyfill لاحقاً.

---

## 📞 للمساعدة

إذا واجهت أي مشاكل، راجع:
1. التأكد من تثبيت جميع الـ dependencies
2. التأكد من وجود Tailwind CSS
3. فحص Console للأخطاء
4. التأكد من أذونات الكاميرا للباركود

---

**تم الإنشاء بواسطة:** Cascade AI  
**التاريخ:** 2025-10-18  
**الإصدار:** 1.0.0
