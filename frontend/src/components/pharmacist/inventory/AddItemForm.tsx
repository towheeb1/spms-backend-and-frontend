// src/components/inventory/AddItemForm.tsx
import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { BarcodeScanner } from '../../ui/BarcodeScanner';
import { api } from '../../../services/api';
import { useToast } from '../../ui/Toast';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddItemForm({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [qty, setQty] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const toast = useToast();

  const handleScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    setShowScanner(false);
  };

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم الدواء');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      toast.error('يرجى إدخال كمية صحيحة');
      return;
    }

    try {
      setSaving(true);
      await api.post('/medicines', {
        name: name.trim(),
        price: price ? Number(price) : 0,
        barcode: barcode.trim() || null,
        category: category.trim() || null,
        stock_qty: Number(qty),
        expiry_date: expiryDate || null,
        batch_no: batchNo.trim() || null,
        storage_location: location.trim() || null,
      });
      toast.success('تمت إضافة العنصر بنجاح');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل في إضافة العنصر');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card rounded-2xl p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
      <h2 className="text-xl font-semibold mb-4">إضافة عنصر جديد للمخزون</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input placeholder="اسم الدواء" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="number" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} />
        <div className="relative">
          <Input placeholder="الباركود (مشفر)" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
            title="مسح بالكاميرا"
          >
            📷
          </button>
        </div>
        <Input placeholder="الفئة" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input type="number" placeholder="الكمية" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Input type="date" placeholder="تاريخ الانتهاء" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        <Input placeholder="رقم الدفعة" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
        <Input placeholder="موقع التخزين" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSubmit} loading={saving}>إضافة العنصر</Button>
        <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          hashBarcode={true}
          title="مسح باركود الدواء"
        />
      )}
    </div>
  );
}