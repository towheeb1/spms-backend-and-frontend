// src/components/pharmacist/pos/POSMedicineSearch.tsx

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiPackage, FiLoader } from "react-icons/fi"; // استخدام react-icons
import type { Medicine } from "./types"; // ✅ تم التعديل

interface Props {
  medicines?: Medicine[]; // قائمة الأدوية من الخادم
  onAddToCart: (medicine: Medicine) => void; // دالة لاستدعاء عند إضافة دواء
  onSearch?: (query: string) => Promise<Medicine[]>; // دالة البحث
}

export default function POSMedicineSearch({ medicines = [], onAddToCart, onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>(medicines);
  const [isFocused, setIsFocused] = useState(false); // لتحديد ما إذا كان المدخل مُركزًا
  const [searching, setSearching] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    setResults(medicines);
  }, [medicines]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let active = true;
    cancelRef.current = false;

    const run = async () => {
      if (onSearch) {
        try {
          setSearching(true);
          const data = await onSearch(query);
          if (active && !cancelRef.current) {
            setResults(data);
          }
        } catch {
          if (active && !cancelRef.current) setResults([]);
        } finally {
          if (active && !cancelRef.current) setSearching(false);
        }
      } else {
        const filtered = medicines.filter((m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) || m.barcode?.includes(query)
        );
        if (active && !cancelRef.current) setResults(filtered);
      }
    };

    const debounce = setTimeout(run, 250);
    return () => {
      active = false;
      cancelRef.current = true;
      clearTimeout(debounce);
    };
  }, [query, medicines, onSearch]);

  const handleAddClick = (medicine: Medicine) => {
    onAddToCart(medicine);
    setQuery(""); // مسح البحث بعد الإضافة
    setResults([]);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
         <h3 className="text-lg font-semibold text-white">البحث عن الأدوية</h3>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // لتمكين النقر على النتائج
          placeholder="ابحث عن دواء بالاسم أو الباركود..."
          className="w-full p-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 text-white placeholder-slate-500"
        />

        {/* أيقونة في داخل الحقل */}
        <div className="absolute right-3 top-3.5 text-slate-500">
         </div>
      </div>

      {/* عرض النتائج أدناه */}
      {isFocused && query && results.length > 0 && (
        <div className="mt-2 border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto bg-white/10 z-10 absolute w-full backdrop-blur-md">
          {results.map((med) => (
            <div
              key={med.id}
              className="p-3 border-b border-white/10 cursor-pointer hover:bg-white/10 flex justify-between items-center"
              onClick={() => handleAddClick(med)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400">
                  <FiPackage size={16} />
                </div>
                <div>
                  <div className="font-medium text-white">{med.name}</div>
                  <div className="text-xs text-slate-400">
                    السعر: {med.price} | المتوفر: {med.stock_qty}
                    {med.barcode && ` | ${med.barcode}`}
                  </div>
                </div>
              </div>
              <button
                className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation(); // لمنع تفعيل div الخارجي
                  handleAddClick(med);
                }}
              >
                <FiPlus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isFocused && query && results.length === 0 && !searching && (
        <div className="mt-2 p-3 text-center text-slate-400 bg-white/5 rounded-lg border border-white/10">
          لا توجد نتائج لـ "{query}"
        </div>
      )}

      {isFocused && searching && (
        <div className="mt-2 flex items-center gap-2 p-3 text-sm text-slate-400 bg-white/5 rounded-lg border border-white/10">
          <FiLoader className="animate-spin" />
          <span>جاري البحث...</span>
        </div>
      )}
    </div>
  );
}