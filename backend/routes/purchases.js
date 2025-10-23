// backend/routes/purchases.js (Express example)

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Purchase, PurchaseItem, Medicine, InventoryMovement, Supplier } = require('../models');
const sequelize = require('../models').sequelize;

// POST /api/purchases
router.post('/', async (req, res) => {
  try {
    const {
      supplier_id,
      items,
      notes,
      currency,
      supplier_reference,
      exchange_rate,
      order_date,
      expected_date,
      payment_terms,
      credit_days,
      down_payment,
      installments_count,
      installment_frequency,
      first_due_date,
      shipping_terms,
      total_amount,
      amount_received,
      amount_remaining,
      expiry_date,
    } = req.body;

    if (!supplier_id) {
      return res.status(400).json({ success: false, message: 'supplier_id is required' });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'items must be a non-empty array' });
    }

    const normalizeNumber = (value, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const normalizeString = (value) => {
      if (value === null || value === undefined) return undefined;
      const text = String(value).trim();
      return text.length ? text : undefined;
    };

    const normalizedItems = items.map((item = {}) => {
      const quantity = normalizeNumber(item.quantity, 0);
      const wholesale = normalizeNumber(item.wholesale_price ?? item.price ?? 0, 0);
      const packsPerCarton = normalizeNumber(item.packs_per_carton, 0);
      const blistersPerPack = normalizeNumber(item.blisters_per_pack, 0);
      const tabletsPerBlister = normalizeNumber(item.tablets_per_blister, 0);

      const cartonPrice = wholesale;
      const retailPrice = packsPerCarton > 0 ? cartonPrice / packsPerCarton : 0;
      const blisterPrice = blistersPerPack > 0 ? retailPrice / blistersPerPack : 0;
      const tabletPrice = tabletsPerBlister > 0 ? blisterPrice / Math.max(tabletsPerBlister ? tabletsPerBlister : 1, 1) : 0;

      const subtotal = quantity * cartonPrice;

      return {
        name: normalizeString(item.name) || 'منتج غير مسمى',
        category: normalizeString(item.category) || null,
        supplier_item_code: normalizeString(item.supplier_item_code) || null,
        quantity,
        price: cartonPrice,
        wholesale_price: cartonPrice,
        retail_price: retailPrice,
        carton_price: cartonPrice,
        blister_price: blisterPrice,
        tablet_price: tabletPrice,
        packs_per_carton: packsPerCarton || null,
        blisters_per_pack: blistersPerPack || null,
        tablets_per_blister: tabletsPerBlister || null,
        unit: normalizeString(item.unit) || 'carton',
        barcode: normalizeString(item.barcode) || null,
        batch_no: normalizeString(item.batch_no) || null,
        expiry_date: item.expiry_date || null,
        subtotal,
        branch: normalizeString(item.branch) || null,
      };
    });

    const computedTotal = normalizedItems.reduce((sum, item) => sum + normalizeNumber(item.subtotal, 0), 0);
    const total = normalizeNumber(total_amount, computedTotal);
    const received = normalizeNumber(amount_received, 0);
    const remaining = normalizeNumber(amount_remaining, total - received >= 0 ? total - received : 0);

    // إنشاء الشراء
    const purchase = await Purchase.create({
      supplier_id,
      currency,
      supplier_reference,
      exchange_rate,
      order_date,
      expected_date,
      payment_terms,
      credit_days,
      down_payment,
      installments_count,
      installment_frequency,
      first_due_date,
      shipping_terms,
      total_amount: total,
      amount_received: received,
      amount_remaining: remaining,
      expiry_date,
      notes,
    });

    // إضافة العناصر (افتراض جدول purchase_items)
    for (const item of normalizedItems) {
      await PurchaseItem.create({
        purchase_id: purchase.id,
        ...item,
      });
    }

    res.status(201).json({ success: true, purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء أمر الشراء' });
  }
});

// GET /api/purchases/:id إلخ (أضف حسب الحاجة)

// GET /purchases/:id - جلب تفاصيل أمر شراء واحد مع العناصر
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user?.pharmacy_id;

    if (!pharmacyId) {
      return res.status(401).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    // البحث عن أمر الشراء مع العناصر والتأكد من أنه ينتمي للصيدلية
    const purchase = await Purchase.findOne({
      where: {
        id: id,
        pharmacy_id: pharmacyId
      },
      include: [
        {
          model: PurchaseItem,
          as: 'PurchaseItems'
        },
        {
          model: Supplier,
          as: 'Supplier'
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // تحويل البيانات إلى التنسيق المطلوب للواجهة الأمامية
    const formattedPurchase = {
      id: purchase.id,
      supplier_id: purchase.supplier_id,
      supplier_name: purchase.Supplier?.name || 'غير محدد',
      status: purchase.status,
      total_amount: purchase.total_amount,
      currency: purchase.currency,
      supplier_reference: purchase.supplier_reference,
      exchange_rate: purchase.exchange_rate,
      order_date: purchase.order_date,
      expected_date: purchase.expected_date,
      payment_terms: purchase.payment_terms,
      credit_days: purchase.credit_days,
      down_payment: purchase.down_payment,
      installments_count: purchase.installments_count,
      installment_frequency: purchase.installment_frequency,
      first_due_date: purchase.first_due_date,
      shipping_terms: purchase.shipping_terms,
      amount_received: purchase.amount_received,
      amount_remaining: purchase.amount_remaining,
      expiry_date: purchase.expiry_date,
      notes: purchase.notes,
      created_at: purchase.created_at,
      updated_at: purchase.updated_at,
      // إضافة معلومات العناصر
      items: purchase.PurchaseItems?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        received_qty: item.received_qty,
        price: item.price,
        barcode: item.barcode,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        subtotal: item.subtotal,
        unit: item.unit,
        packs_per_carton: item.packs_per_carton,
        blisters_per_pack: item.blisters_per_pack,
        tablets_per_blister: item.tablets_per_blister,
        wholesale_price: item.wholesale_price,
        retail_price: item.retail_price,
        carton_price: item.carton_price,
        blister_price: item.blister_price,
        tablet_price: item.tablet_price,
        supplier_item_code: item.supplier_item_code,
        branch: item.branch,
        medicine_id: item.medicine_id
      })) || []
    };

    res.json(formattedPurchase);
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل أمر الشراء',
      error: error.message
    });
  }
});

// POS routes
router.get('/pos/invoices', async (req, res) => {
  try {
    const invoices = await Purchase.getAllWithItems();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching POS invoices:', error);
    res.status(500).json({ error: 'Failed to fetch POS invoices' });
  }
});

router.get('/pos/draft', async (req, res) => {
  try {
    const draftInvoices = await Purchase.getDraftInvoices();
    res.json(draftInvoices);
  } catch (error) {
    console.error('Error fetching draft invoices:', error);
    res.status(500).json({ error: 'Failed to fetch draft invoices' });
  }
});

router.get('/pos/posted', async (req, res) => {
  try {
    const postedInvoices = await Purchase.getPostedInvoices();
    res.json(postedInvoices);
  } catch (error) {
    console.error('Error fetching posted invoices:', error);
    res.status(500).json({ error: 'Failed to fetch posted invoices' });
  }
});

// POST /api/purchases/:poId/receive
router.post('/:poId/receive', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { poId } = req.params;
    const { items } = req.body;
    const pharmacyId = req.user?.pharmacy_id;

    if (!pharmacyId) {
      return res.status(401).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // التحقق من وجود أمر الشراء والتأكد من أنه ينتمي للصيدلية
    const purchase = await Purchase.findOne({
      where: {
        id: poId,
        pharmacy_id: pharmacyId,
        status: 'ordered' // يجب أن يكون في حالة ordered
      },
      include: [{
        model: PurchaseItem,
        as: 'PurchaseItems'
      }],
      transaction
    });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found or not in ordered status'
      });
    }

    // التحقق من أن الكميات المستلمة لا تتجاوز الكميات المطلوبة
    for (const receivedItem of items) {
      const purchaseItem = purchase.PurchaseItems.find(
        item => item.id === receivedItem.purchase_item_id
      );

      if (!purchaseItem) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Purchase item with ID ${receivedItem.purchase_item_id} not found`
        });
      }

      if (receivedItem.received_qty > purchaseItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Received quantity for ${purchaseItem.name} cannot exceed ordered quantity (${purchaseItem.quantity})`
        });
      }
    }

    // معالجة كل عنصر
    for (const receivedItem of items) {
      const { purchase_item_id, received_qty, batch_no, expiry_date } = receivedItem;

      const purchaseItem = purchase.PurchaseItems.find(
        item => item.id === purchase_item_id
      );

      if (!purchaseItem) continue;

      // البحث عن الدواء في جدول medicines
      let medicine = await Medicine.findOne({
        where: {
          pharmacy_id: pharmacyId,
          [Op.or]: [
            { barcode: purchaseItem.barcode },
            { id: purchaseItem.medicine_id }
          ]
        },
        transaction
      });

      let medicineId = purchaseItem.medicine_id;

      // إذا لم يكن الدواء موجوداً، أنشئ دواء جديد
      if (!medicine) {
        medicine = await Medicine.create({
          name: purchaseItem.name,
          barcode: purchaseItem.barcode,
          price: purchaseItem.price,
          stock_qty: 0,
          category: purchaseItem.category,
          pharmacy_id: pharmacyId,
          batch_no: batch_no,
          expiry_date: expiry_date,
          is_active: true
        }, { transaction });

        medicineId = medicine.id;

        // تحديث purchase_item بالـ medicine_id الجديد
        await purchaseItem.update({
          medicine_id: medicineId,
          received_qty: (purchaseItem.received_qty || 0) + received_qty,
          batch_no: batch_no,
          expiry_date: expiry_date
        }, { transaction });
      } else {
        // تحديث المخزون للدواء الموجود
        await medicine.update({
          stock_qty: medicine.stock_qty + received_qty,
          price: purchaseItem.price, // تحديث السعر إذا لزم
          batch_no: batch_no,
          expiry_date: expiry_date
        }, { transaction });

        // تحديث purchase_item
        await purchaseItem.update({
          received_qty: (purchaseItem.received_qty || 0) + received_qty,
          batch_no: batch_no,
          expiry_date: expiry_date
        }, { transaction });
      }

      // تسجيل حركة المخزون
      await InventoryMovement.create({
        medicine_id: medicineId,
        type: 'in',
        quantity: received_qty,
        reference: `purchase_order:${poId}`,
        notes: `استلام من أمر شراء ${poId}`,
        pharmacist_id: req.user?.id || 1, // استخدم ID المستخدم الحالي
        pharmacy_id: pharmacyId,
        batch_no: batch_no,
        expiry_date: expiry_date,
        unit_cost: purchaseItem.price,
        unit_price: purchaseItem.price
      }, { transaction });
    }

    // التحقق من اكتمال جميع العناصر
    const allItemsReceived = purchase.PurchaseItems.every(
      item => (item.received_qty || 0) >= item.quantity
    );

    // تحديث حالة أمر الشراء
    await purchase.update({
      status: allItemsReceived ? 'received' : 'ordered'
    }, { transaction });

    // حفظ التغييرات
    await transaction.commit();

    res.json({
      success: true,
      message: allItemsReceived ? 'تم استلام أمر الشراء بالكامل' : 'تم استلام بعض العناصر',
      purchase: {
        id: purchase.id,
        status: purchase.status,
        received_items: items.length
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error receiving purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في استلام أمر الشراء',
      error: error.message
    });
  }
});
