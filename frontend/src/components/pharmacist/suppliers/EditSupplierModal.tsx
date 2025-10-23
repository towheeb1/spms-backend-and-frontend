// src/components/suppliers/EditSupplierModal.tsx
import { useState } from "react";
import { Supplier } from "./types";
import './style/EditSupplierModal.css';

interface Props {
  supplier: Supplier;
  onClose: () => void;
  onUpdate: (id: string | number, data: Partial<Supplier>) => void;
}

export default function EditSupplierModal({ supplier, onClose, onUpdate }: Props) {
  const [formData, setFormData] = useState<Partial<Supplier>>({ ...supplier });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(supplier.id, formData);
    onClose();
  };

  return (
    <div className="edit-supplier-modal-overlay">
      <div className="edit-supplier-modal-content">
        <div className="edit-supplier-modal-header">
          <h3 className="edit-supplier-modal-title">تعديل المورد</h3>
          <button onClick={onClose} className="edit-supplier-modal-close-button">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-supplier-modal-form">
          <div className="edit-supplier-modal-form-group">
            <label>اسم المورد *</label>
            <input
              type="text"
              className="edit-supplier-modal-input"
              value={formData.name || ""}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="edit-supplier-modal-form-group">
            <label>الفئة</label>
            <input
              type="text"
              className="edit-supplier-modal-input"
              value={formData.category || ""}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="edit-supplier-modal-form-group">
            <label>رقم الهاتف</label>
            <input
              type="tel"
              className="edit-supplier-modal-input"
              value={formData.phone || ""}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="edit-supplier-modal-form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              className="edit-supplier-modal-input"
              value={formData.email || ""}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="edit-supplier-modal-form-group">
            <label>العنوان</label>
            <textarea
              className="edit-supplier-modal-textarea"
              value={formData.address || ""}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="edit-supplier-modal-actions">
            <button type="submit" className="edit-supplier-modal-button-submit">
              حفظ التعديلات
            </button>
            <button type="button" onClick={onClose} className="edit-supplier-modal-button-cancel">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}