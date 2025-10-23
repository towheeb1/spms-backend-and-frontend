// backend/models/InventoryMovement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  medicine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicines',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'adjustment', 'expiry', 'damage'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pharmacist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pharmacy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  batch_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: true,
  },
}, {
  tableName: 'inventory_movements',
  timestamps: true,
});

// العلاقات
InventoryMovement.associate = (models) => {
  InventoryMovement.belongsTo(models.Medicine, { foreignKey: 'medicine_id' });
  InventoryMovement.belongsTo(models.Pharmacist, { foreignKey: 'pharmacist_id' });
};

module.exports = InventoryMovement;
