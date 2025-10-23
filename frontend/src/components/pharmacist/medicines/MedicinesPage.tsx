// src/components/medicines/MedicinesPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { Med } from './types';
import MedicinesForm from './MedicinesForm';
import MedicinesList from './MedicinesList';
import MedicinesFilters from './MedicinesFilters';
import MedicinesStats from './MedicinesStats';
import { listMedicines, createMedicine, updateMedicine, deleteMedicine as deleteMedicineApi } from '../../../services/medicines';
import { useToast } from '../../ui/Toast';

export default function MedicinesPage() {
  const [items, setItems] = useState<Med[]>([]);
  const [filteredItems, setFilteredItems] = useState<Med[]>([]);
  const [f, setF] = useState<Med>({
    trade_name: '',
    price: 0,
    stock: 0,
    min_stock: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const toast = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Use the service helper which normalizes the response to an array
      const medicines = await listMedicines();
      const arr = Array.isArray(medicines) ? medicines : [];
      setItems(arr as any);

      const uniqueCategories = Array.from(
        new Set(arr.map((m: any) => m.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading medicines:', error);
      toast.error('فشل في تحميل الأدوية');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- منطق التصفية والفرز ---
  useEffect(() => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.barcode?.includes(searchTerm) ||
        med.atc?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(med => med.category === categoryFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.trade_name || '').localeCompare(b.trade_name || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, categoryFilter, sortBy, sortOrder]);

  

  // --- وظائف CRUD ---
  const resetForm = useCallback(() => {
    setF({ trade_name: '', price: 0, stock: 0, min_stock: 0 });
    setEditingId(null);
  }, []);

  const save = useCallback(async () => {
    const tradeName = String(f.trade_name || '').trim();
    if (!tradeName) {
      toast.error('يرجى إدخال اسم الدواء');
      return;
    }

    const priceNum = Number.isFinite(Number(f.price)) ? Number(f.price) : 0;
    const payload = {
      name: tradeName,
      price: Math.max(0, priceNum),
      barcode: String((f as any).barcode || '').trim() || null,
      category: String((f as any).category || '').trim() || null,
      manufacturer: String((f as any).manufacturer || '').trim() || null,
      dosage: String((f as any).dosage || '').trim() || null,
      stock_qty: Number(f.stock || 0),
      min_stock: Number(f.min_stock || 0),
    };

    try {
      if (editingId) {
        await updateMedicine(editingId, payload as any);
        toast.success('تم تحديث الدواء بنجاح');
      } else {
        await createMedicine(payload as any);
        toast.success('تمت إضافة الدواء بنجاح');
      }
      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Error saving medicine:', error);
      toast.error(error?.response?.data?.error || 'فشل في حفظ الدواء');
    }
  }, [f, editingId, loadData, toast, resetForm]);

  const remove = useCallback(async (id?: number) => {
    if (!id || !confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
    try {
      await deleteMedicineApi(id as number);
      toast.success('تم حذف الدواء بنجاح');
      await loadData();
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast.error(error?.response?.data?.error || 'فشل في حذف الدواء');
    }
  }, [loadData, toast]);

  const editItem = useCallback((item: Med) => {
    setF({
      trade_name: item.trade_name || '',
      price: item.price || 0,
      barcode: item.barcode || '',
      atc: item.atc || '',
      category: item.category || '',
      manufacturer: item.manufacturer || '',
      dosage: item.dosage || '',
      stock: item.stock || 0,
      min_stock: item.min_stock || 0
    });
    setEditingId(item.id || null);
  }, []);

  

  const getStockStatus = useCallback((stock?: number, minStock?: number) => {
    if (stock === undefined || minStock === undefined) return null;
    if (stock <= minStock) return { status: 'low', color: 'bg-red-500/20 text-red-300' };
    if (stock <= minStock * 2) return { status: 'medium', color: 'bg-yellow-500/20 text-yellow-300' };
    return { status: 'good', color: 'bg-green-500/20 text-green-300' };
  }, []);

  return (
    <div className="grid gap-6">
      {/* العنوان */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأدوية</h1>
          <p className="text-gray-400 mt-1">إضافة وتعديل وحذف الأدوية في النظام</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-400">إجمالي الأدوية:</span>
            <span className="font-semibold text-white ml-2">{items.length}</span>
          </div>
        </div>
      </div>

      {/* التصفية */}
      <MedicinesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        categories={categories}
        onAddNew={resetForm}
      />

      {/* النموذج */}
      <MedicinesForm
        formData={f}
        onFieldChange={setF}
        onSave={save}
        onCancel={resetForm}
        editingId={editingId}
      />

      {/* حالة التحميل */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* القائمة */}
      {!loading && (
        <MedicinesList
          items={filteredItems}
          totalItems={items.length}
          onEdit={editItem}
          onDelete={remove}
          getStockStatus={getStockStatus}
          onAddNew={resetForm}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
        />
      )}

      {/* الإحصائيات */}
      {!loading && items.length > 0 && (
        <MedicinesStats items={items} />
      )}
    </div>
  );
}