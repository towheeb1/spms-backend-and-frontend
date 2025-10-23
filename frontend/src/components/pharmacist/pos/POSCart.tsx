// src/components/pharmacist/pos/POSCart.tsx

import React from "react";
import { FaTrashAlt } from "react-icons/fa"; // أيقونة الحذف
import { FiPlus, FiMinus } from "react-icons/fi"; // أيقونات زيادة/نقصان الكمية
import type { CartItem } from "./types"; // ✅ تم التعديل
import "./style/POSCart.css";

interface Props {
  cart: CartItem[];
  onQtyChange: (medicineId: number, qty: number) => void;
  onDelete: (medicineId: number) => void;
  total: number;
  formatPrice?: (value: number) => string;
}

export default function POSCart({ cart, onQtyChange, onDelete, total, formatPrice }: Props) {
  const format = (value: number) => {
    if (formatPrice) {
      return formatPrice(value);
    }
    return value.toFixed(2);
  };

  return (
    <div className="pos-cart-container">
      <h3 className="pos-cart-header">
        <span className="pos-cart-icon">🛒</span> سلة المشتريات
      </h3>

      {cart.length === 0 ? (
        <div className="pos-cart-empty">
          <p className="pos-cart-empty-message">لا توجد أدوية في السلة</p>
        </div>
      ) : (
        <>
          <div className="pos-cart-items">
            {cart.map((item) => (
              <div
                key={item.medicine_id}
                className="pos-cart-item"
              >
                {/* اسم الدواء */}
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.name}</div>
                  <div className="pos-cart-item-details">
                    السعر: {format(item.unit_price)}
                    {item.unit_label ? ` (${item.unit_label})` : ''}
                    {' | '}
                    الإجمالي: {format(item.total)}
                  </div>
                </div>

                {/* تحكم في الكمية */}
                <div className="pos-cart-quantity-section">
                  <button
                    onClick={() => onQtyChange(item.medicine_id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    className={`pos-quantity-button ${item.qty <= 1 ? 'disabled' : ''}`}
                  >
                    <FiMinus size={16} />
                  </button>

                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      onQtyChange(item.medicine_id, Math.max(1, Number(e.target.value)))
                    }
                    className="pos-quantity-input"
                    min={1}
                  />

                  <button
                    onClick={() => onQtyChange(item.medicine_id, item.qty + 1)}
                    className="pos-quantity-button"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* زر الحذف */}
                <button
                  onClick={() => onDelete(item.medicine_id)}
                  className="pos-delete-button"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* الإجمالي */}
          <div className="pos-cart-total-section">
            <div className="pos-cart-total-row">
              <span className="pos-cart-total-label">الإجمالي:</span>
              <span className="pos-cart-total-amount">{format(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}