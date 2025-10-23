// src/components/medicines/MedicinesFilters.tsx
import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: 'name' | 'price' | 'stock';
  onSortByChange: (value: 'name' | 'price' | 'stock') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  categories: string[];
  onAddNew: () => void;
}

export default function MedicinesFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  categories,
  onAddNew
}: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  async function startScan() {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setScanning(true);
      const el = document.getElementById('med-filter-scan-video') as HTMLVideoElement | null;
      if (el) {
        el.srcObject = stream;
        await el.play();
      }
      const hasDetector = 'BarcodeDetector' in window as any;
      // @ts-ignore
      const detector = hasDetector ? new (window as any).BarcodeDetector({ formats: ['qr_code','code_128','ean_13','ean_8','upc_a','upc_e'] }) : null;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let stop = false;
      async function tick() {
        if (!el || stop) return;
        if (el.readyState >= 2 && detector) {
          canvas.width = el.videoWidth;
          canvas.height = el.videoHeight;
          ctx?.drawImage(el, 0, 0, canvas.width, canvas.height);
          try {
            const bitmap = await createImageBitmap(canvas);
            const codes = await detector.detect(bitmap);
            if (codes && codes.length > 0) {
              const val = codes[0].rawValue || codes[0].value || '';
              if (val) {
                onSearchChange(val);
                stopScan();
                return;
              }
            }
          } catch {}
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      function stopScan() {
        stop = true;
        if (el) el.pause();
        if (el && el.srcObject) (el.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        setScanning(false);
      }
      ;(window as any).__medFilterStopScan = stopScan;
    } catch (e) {
      setScanError('تعذر الوصول للكاميرا');
    }
  }

  function stopScanExternal() {
    const fn = (window as any).__medFilterStopScan;
    if (fn) fn();
  }
  return (
    <div className="card rounded-2xl p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs opacity-70 block mb-2">بحث</label>
          <div className="relative">
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <button
              type="button"
              onClick={startScan}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              title="مسح باركود للبحث"
            >
              📷
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-2">الفئة</label>
          <Select 
            value={categoryFilter}
            onChange={(v) => onCategoryChange(String(v))}
            options={[{ label: 'جميع الفئات', value: 'all' }, ...categories.map(c => ({ label: c, value: c }))]}
          />
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-2">ترتيب حسب</label>
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(v) => onSortByChange(v as any)}
              options={[
                { label: 'الاسم', value: 'name' },
                { label: 'السعر', value: 'price' },
                { label: 'المخزون', value: 'stock' },
              ]}
              className="flex-1"
            />
            <button
              onClick={onSortOrderToggle}
              className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <Button onClick={onAddNew} className="w-full" variant="outline">
            إضافة دواء جديد
          </Button>
        </div>
      </div>
      {scanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card rounded-2xl p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">مسح باركود</div>
              <button onClick={stopScanExternal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {scanError && <div className="text-red-300 text-sm mb-2">{scanError}</div>}
            <video id="med-filter-scan-video" className="w-full rounded-lg border border-white/10" playsInline muted />
            <div className="mt-2 text-xs opacity-70">وجّه الكاميرا نحو الباركود</div>
          </div>
        </div>
      )}
    </div>
  );
}