const PurchaseItem = sequelize.define('PurchaseItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchases',
      key: 'id',
    },
  },
  medicine_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'medicines',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  supplier_item_code: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  received_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
  },
  wholesale_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0,
  },
  retail_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0,
  },
  carton_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0,
  },
  blister_price: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0,
  },
  tablet_price: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false,
    defaultValue: 0,
  },
  packs_per_carton: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  blisters_per_pack: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tablets_per_blister: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING(50),
    defaultValue: 'carton',
  },
  barcode: {
    type: DataTypes.STRING(100),
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
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'purchase_items',
  timestamps: true,
});

// العلاقات
PurchaseItem.associate = (models) => {
  PurchaseItem.belongsTo(models.Purchase, { foreignKey: 'purchase_id' });
  PurchaseItem.belongsTo(models.Medicine, { foreignKey: 'medicine_id' });
};

module.exports = PurchaseItem;
