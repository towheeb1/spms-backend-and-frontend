// backend/models/Supplier.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tax_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  pharmacy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'suppliers',
  timestamps: true,
});

// العلاقات
Supplier.associate = (models) => {
  Supplier.hasMany(models.Purchase, { foreignKey: 'supplier_id' });
};

module.exports = Supplier;
