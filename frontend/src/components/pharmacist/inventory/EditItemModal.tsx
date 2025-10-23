// src/components/inventory/EditItemModal.tsx
import { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Med } from './types';
import { openDB } from 'idb';

const DB_NAME = 'spms';
const STORE = 'meds';

interface Props {
  item: Med;
  onClose: () => void;
  onSave: () => void;
}

export default function EditItemModal({ item, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Med>({ ...item });

  useEffect(() => {
    setFormData({ ...item });
  }, [item]);

  const handleChange = (field: keyof Med, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trade_name?.trim()) return;

    try {
      const db = await openDB(DB_NAME, 1);
      await db.put(STORE, {
        ...formData,
        price: Number(formData.price) || 0,
        qty: Number(formData.qty) || 0,
        min_stock: Number(formData.min_stock) || 10,
        last_updated: new Date().toISOString()
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('فشل تحديث العنصر. تحقق من البيانات.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تعديل العنصر</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-80 block mb-2">اسم الدواء *</label>
            <Input
              value={formData.trade_name}
              onChange={e => handleChange('trade_name', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">السعر</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => handleChange('price', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">الكمية</label>
            <Input
              type="number"
              value={formData.qty || 0}
              onChange={e => handleChange('qty', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">تاريخ الانتهاء</label>
            <Input
              type="date"
              value={formData.expiry || ''}
              onChange={e => handleChange('expiry', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">الباركود</label>
            <Input
              value={formData.barcode || ''}
              onChange={e => handleChange('barcode', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">الفئة</label>
            <Input
              value={formData.category || ''}
              onChange={e => handleChange('category', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">رقم الدفعة</label>
            <Input
              value={formData.batch_number || ''}
              onChange={e => handleChange('batch_number', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">موقع التخزين</label>
            <Input
              value={formData.location || ''}
              onChange={e => handleChange('location', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm opacity-80 block mb-2">الحد الأدنى للمخزون</label>
            <Input
              type="number"
              value={formData.min_stock || 10}
              onChange={e => handleChange('min_stock', parseInt(e.target.value) || 10)}
            />
          </div>
        </form>
        
        <div className="flex gap-2 mt-6">
          <Button onClick={handleSubmit}>حفظ التغييرات</Button>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}