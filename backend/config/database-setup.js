// في backend/app.js أو server.js، أضف:

const purchaseRoutes = require('./routes/purchases');

app.use('/api/purchases', purchaseRoutes);

// تأكد من استيراد النماذج وتشغيل sequelize.sync() في بداية التطبيق

// في models/index.js أو config:

const sequelize = new Sequelize(/* config */);

// استيراد النماذج
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');

// العلاقات
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id' });

// sync
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
});
