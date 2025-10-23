// src/components/suppliers/AddSupplierModal.tsx
import { useState } from "react";
import './style/AddSupplierModal.css';

interface Props {
  onClose: () => void;
  // onAdd may return a promise so the modal can show loading while request is in progress
  onAdd: (data: { name: string; category: string; phone: string; email: string; address: string }) => Promise<any> | void;
}

export default function AddSupplierModal({ onClose, onAdd }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    phone: "",
    email: "",
    address: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // allow parent to return a promise
    const res = onAdd(formData);
    if (res && typeof (res as any).then === 'function') {
      setSaving(true);
      (res as Promise<any>).finally(() => setSaving(false));
    }
  };

  return (
    <div className="add-supplier-modal-overlay">
      <div className="add-supplier-modal-content">
        <div className="add-supplier-modal-header">
          <h3 className="add-supplier-modal-title">إضافة مورد جديد</h3>
          <button onClick={onClose} className="add-supplier-modal-close-button">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-supplier-modal-form">
          <div className="add-supplier-modal-form-group">
            <label>اسم المورد *</label>
            <input
              type="text"
              className="add-supplier-modal-input"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="add-supplier-modal-form-group">
            <label>الفئة</label>
            <input
              type="text"
              className="add-supplier-modal-input"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <div className="add-supplier-modal-form-group">
            <label>رقم الهاتف</label>
            <input
              type="tel"
              className="add-supplier-modal-input"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="add-supplier-modal-form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              className="add-supplier-modal-input"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="add-supplier-modal-form-group">
            <label>العنوان</label>
            <textarea
              className="add-supplier-modal-textarea"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          
          <div className="add-supplier-modal-actions">
            <button
              type="submit"
              disabled={saving}
              className="add-supplier-modal-button-submit"
            >
              {saving ? 'جاري الحفظ...' : 'إضافة المورد'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="add-supplier-modal-button-cancel"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}