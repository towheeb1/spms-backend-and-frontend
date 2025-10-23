// src/components/inventory/InventoryStats.tsx
import { Med } from './types';

interface Props {
  items: Med[];
  lowStock: Med[];
  nearExpiry: Med[];
  expired: Med[];
  criticalStock: Med[];
}

export default function InventoryStats({ items, lowStock, nearExpiry, expired, criticalStock }: Props) {
  const stats = [
    { 
      label: 'إجمالي العناصر', 
      value: items.length, 
      icon: '📦', 
      bgColor: 'bg-gradient-to-br from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-300',
      iconBg: 'bg-green-500/20'
    },
    { 
      label: 'مخزون منخفض', 
      value: lowStock.length, 
      icon: '📉', 
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      iconBg: 'bg-blue-500/20'
    },
    { 
      label: 'نفاذ المخزون', 
      value: criticalStock.length, 
      icon: '⚠️', 
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-300',
      iconBg: 'bg-orange-500/20'
    },
    { 
      label: 'قريب الانتهاء', 
      value: nearExpiry.length, 
      icon: '📅', 
      bgColor: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-300',
      iconBg: 'bg-yellow-500/20'
    },
    { 
      label: 'منتهي الصلاحية', 
      value: expired.length, 
      icon: '❌', 
      bgColor: 'bg-gradient-to-br from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-300',
      iconBg: 'bg-red-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={`card rounded-2xl p-5 ${stat.bgColor} border ${stat.borderColor} hover:scale-105 transition-transform duration-200 cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold mb-1 animate-in fade-in duration-500">{stat.value}</div>
              <div className={`text-sm ${stat.textColor} font-medium`}>{stat.label}</div>
            </div>
            <div className={`${stat.iconBg} rounded-xl p-3 text-3xl`}>{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}