// backend/models/Medicine.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  generic_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  stock_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  min_stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  max_stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  form: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  strength: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  batch_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pharmacy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'medicines',
  timestamps: true,
});

// العلاقات
Medicine.associate = (models) => {
  Medicine.hasMany(models.InventoryMovement, { foreignKey: 'medicine_id' });
  Medicine.hasMany(models.PurchaseItem, { foreignKey: 'medicine_id' });
};

module.exports = Medicine;
