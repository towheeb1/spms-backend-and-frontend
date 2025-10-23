// src/components/medicines/MedicinesForm.tsx
import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { BarcodeScanner } from '../../ui/BarcodeScanner';
import { Med } from './types';

interface Props {
  formData: Med;
  onFieldChange: (value: Med) => void;
  onSave: () => void;
  onCancel: () => void;
  editingId: number | null;
}

export default function MedicinesForm({ formData, onFieldChange, onSave, onCancel, editingId }: Props) {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (scannedBarcode: string) => {
    onFieldChange({ ...formData, barcode: scannedBarcode });
    setShowScanner(false);
  };
  return (
    <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {editingId ? 'تعديل دواء' : 'إضافة دواء جديد'}
        </h2>
        {editingId && (
          <Button onClick={onCancel} variant="ghost" size="sm">
            إلغاء التعديل
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="text-sm opacity-80 block mb-2">اسم الدواء *</label>
          <Input
            placeholder="اسم الدواء التجاري"
            value={String(formData.trade_name || '')}
            onChange={(e) => onFieldChange({ ...formData, trade_name: e.target.value })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">السعر *</label>
          <Input
            type="number"
            step="0.01"
            placeholder="السعر"
            value={formData.price ?? 0}
            onChange={(e) => onFieldChange({ ...formData, price: parseFloat(e.target.value || '0') })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">الباركود</label>
          <div className="relative">
            <Input
              placeholder="رقم الباركود (سيتم تشفيره عند المسح)"
              value={String(formData.barcode || '')}
              onChange={(e) => onFieldChange({ ...formData, barcode: e.target.value })}
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              title="مسح بالكاميرا"
            >
              📷
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">الفئة</label>
            <Input
              placeholder="فئة الدواء"
              value={String(formData.category || '')}
              onChange={(e) => onFieldChange({ ...formData, category: e.target.value })}
              className="w-full"
            />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">الشركة المصنعة</label>
          <Input
            placeholder="اسم الشركة"
            value={String(formData.manufacturer || '')}
            onChange={(e) => onFieldChange({ ...formData, manufacturer: e.target.value })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">الجرعة</label>
          <Input
            placeholder="مثال: 500mg"
            value={String(formData.dosage || '')}
            onChange={(e) => onFieldChange({ ...formData, dosage: e.target.value })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">رمز ATC</label>
          <Input
            placeholder="رمز التصنيف الدوائي"
            value={String(formData.atc || '')}
            onChange={(e) => onFieldChange({ ...formData, atc: e.target.value })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">المخزون الحالي</label>
          <Input
            type="number"
            placeholder="الكمية في المخزون"
            value={formData.stock ?? 0}
            onChange={(e) => onFieldChange({ ...formData, stock: parseInt(e.target.value || '0') })}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm opacity-80 block mb-2">الحد الأدنى للمخزون</label>
          <Input
            type="number"
            placeholder="الحد الأدنى المسموح"
            value={formData.min_stock ?? 0}
            onChange={(e) => onFieldChange({ ...formData, min_stock: parseInt(e.target.value || '0') })}
            className="w-full"
          />
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          hashBarcode={true}
          title="مسح باركود الدواء"
        />
      )}

      <div className="flex gap-3 mt-6">
        <Button 
          onClick={onSave}
          disabled={!String(formData.trade_name || '').trim()}
          className="px-6"
        >
          {editingId ? 'تحديث الدواء' : 'إضافة الدواء'}
        </Button>
        {editingId && (
          <Button onClick={onCancel} variant="outline">
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
}