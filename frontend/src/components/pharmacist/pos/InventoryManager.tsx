// src/components/pharmacist/pos/InventoryManager.tsx
import React, { useState, useEffect } from "react";
import type { CartItem } from "./types";
import { FiPackage, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import "./style/InventoryManager.css";

// واجهة للعنصر في المخزون
interface InventoryItem {
  medicine_id: number;
  name: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  carton_stock?: number;
  blister_stock?: number;
  tablet_stock?: number;
  carton_price?: number;
  blister_price?: number;
  tablet_price?: number;
  packs_per_carton?: number;
  blisters_per_pack?: number;
  tablets_per_blister?: number;
}

interface InventoryManagerProps {
  cartItems: CartItem[];
  onInventoryUpdated?: (updatedItems: InventoryItem[]) => void;
}

export default function InventoryManager({ cartItems, onInventoryUpdated }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // تحميل المخزون من localStorage
  useEffect(() => {
    loadInventory();
  }, []);

  // تحديث المخزون عند تغيير السلة
  useEffect(() => {
    if (cartItems.length > 0) {
      updateInventoryForSale(cartItems);
    }
  }, [cartItems]);

  const loadInventory = () => {
    try {
      const savedInventory = localStorage.getItem('pharmacy_inventory');
      if (savedInventory) {
        const parsed = JSON.parse(savedInventory);
        setInventory(Object.values(parsed));
        checkLowStock(Object.values(parsed));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const checkLowStock = (items: InventoryItem[]) => {
    const lowStock = items.filter(item => item.current_stock <= item.min_stock);
    setLowStockItems(lowStock);
  };

  const updateInventoryForSale = async (items: CartItem[]) => {
    setIsUpdating(true);
    try {
      const currentInventory = JSON.parse(localStorage.getItem('pharmacy_inventory') || '{}');
      const updatedInventory: { [key: number]: InventoryItem } = { ...currentInventory };

      items.forEach(cartItem => {
        const currentItem = updatedInventory[cartItem.medicine_id];
        if (currentItem) {
          // حساب النقص في المخزون
          const newStock = Math.max(0, currentItem.current_stock - cartItem.qty);

          // تحديث جميع مستويات المخزون
          updatedInventory[cartItem.medicine_id] = {
            ...currentItem,
            current_stock: newStock,
            carton_stock: currentItem.packs_per_carton ? Math.floor(newStock / currentItem.packs_per_carton) : currentItem.carton_stock,
            blister_stock: currentItem.blisters_per_pack ? Math.floor((newStock % (currentItem.packs_per_carton || 1)) / currentItem.blisters_per_pack) : currentItem.blister_stock,
            tablet_stock: currentItem.tablets_per_blister ? (newStock % (currentItem.blisters_per_pack || 1)) : currentItem.tablet_stock,
          };
        }
      });

      // حفظ المخزون المحدث
      localStorage.setItem('pharmacy_inventory', JSON.stringify(updatedInventory));
      setInventory(Object.values(updatedInventory));
      checkLowStock(Object.values(updatedInventory));
      onInventoryUpdated?.(Object.values(updatedInventory));

      console.log('Inventory updated after sale:', updatedInventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) return 'out-of-stock';
    if (item.current_stock <= item.min_stock) return 'low-stock';
    if (item.current_stock >= item.max_stock) return 'over-stock';
    return 'normal-stock';
  };

  const getStockStatusText = (item: InventoryItem) => {
    if (item.current_stock === 0) return 'نفد المخزون';
    if (item.current_stock <= item.min_stock) return 'مخزون قليل';
    if (item.current_stock >= item.max_stock) return 'مخزون زائد';
    return 'مخزون طبيعي';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return '#fca5a5';
      case 'low-stock': return '#fbbf24';
      case 'over-stock': return '#86efac';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="inventory-manager">
      {/* تنبيهات المخزون المنخفض */}
      {lowStockItems.length > 0 && (
        <div className="inventory-alerts">
          <div className="alerts-header">
            <FiAlertTriangle className="alerts-icon" />
            <h4 className="alerts-title">تنبيهات المخزون</h4>
          </div>
          <div className="alerts-list">
            {lowStockItems.map((item, index) => (
              <div key={index} className="alert-item">
                <span className="alert-item-name">{item.name}</span>
                <span className="alert-item-stock">
                  متبقي: {item.current_stock} وحدة
                </span>
                <span
                  className="alert-item-status"
                  style={{ color: getStockStatusColor(getStockStatus(item)) }}
                >
                  {getStockStatusText(item)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* حالة التحديث */}
      {isUpdating && (
        <div className="inventory-updating">
          <div className="updating-spinner"></div>
          <span className="updating-text">جاري تحديث المخزون...</span>
        </div>
      )}

      {/* ملخص المخزون */}
      <div className="inventory-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <FiPackage className="summary-icon total" />
            <div className="summary-content">
              <span className="summary-label">إجمالي العناصر</span>
              <span className="summary-value">{inventory.length}</span>
            </div>
          </div>

          <div className="summary-card">
            <FiTrendingUp className="summary-icon normal" />
            <div className="summary-content">
              <span className="summary-label">مخزون طبيعي</span>
              <span className="summary-value">
                {inventory.filter(item => getStockStatus(item) === 'normal-stock').length}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <FiTrendingDown className="summary-icon low" />
            <div className="summary-content">
              <span className="summary-label">مخزون منخفض</span>
              <span className="summary-value">
                {inventory.filter(item => getStockStatus(item) === 'low-stock').length}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <FiAlertTriangle className="summary-icon out" />
            <div className="summary-content">
              <span className="summary-label">نفد المخزون</span>
              <span className="summary-value">
                {inventory.filter(item => getStockStatus(item) === 'out-of-stock').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
