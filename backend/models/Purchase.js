// افتراض أن هذا في backend/models/Purchase.js (Sequelize example)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // افتراض

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pharmacy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'ordered', 'received', 'cancelled'),
    defaultValue: 'draft',
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'YER',
  },
  supplier_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1.0000,
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  expected_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.ENUM('cash', 'credit', 'partial'),
    defaultValue: 'cash',
  },
  credit_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  down_payment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  installments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  installment_frequency: {
    type: DataTypes.ENUM('weekly', 'monthly', 'quarterly'),
    allowNull: true,
  },
  first_due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  shipping_terms: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amount_received: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  amount_remaining: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // إضافة createdAt, updatedAt تلقائياً
}, {
  tableName: 'purchases',
  timestamps: true,
});

// العلاقات
Purchase.associate = (models) => {
  Purchase.belongsTo(models.Supplier, { foreignKey: 'supplier_id' });
  Purchase.hasMany(models.PurchaseItem, { foreignKey: 'purchase_id' });
};

module.exports = Purchase;
