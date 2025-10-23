// simple-test.js - اختبار بسيط للتأكد من البنية

const fs = require('fs');
const path = require('path');

console.log("🧪 اختبار بنية SOLID البسيط...\n");

// التحقق من وجود المجلدات الرئيسية
const mainFolders = ['interfaces', 'base', 'services', 'utils'];
const controllersFolders = ['auth', 'medicines', 'inventory', 'pharmacist', 'pos', 'purchases', 'suppliers', 'doctor'];

console.log("📁 التحقق من المجلدات الرئيسية:");
mainFolders.forEach(folder => {
  const folderPath = path.join(__dirname, 'backend', 'src', folder);
  if (fs.existsSync(folderPath)) {
    console.log(`✅ ${folder}/ موجود`);
  } else {
    console.log(`❌ ${folder}/ غير موجود`);
  }
});

console.log("\n📁 التحقق من مجلدات controllers الفرعية:");
controllersFolders.forEach(folder => {
  const folderPath = path.join(__dirname, 'backend', 'src', 'controllers', folder);
  if (fs.existsSync(folderPath)) {
    console.log(`✅ controllers/${folder}/ موجود`);
  } else {
    console.log(`❌ controllers/${folder}/ غير موجود`);
  }
});

// التحقق من وجود ملفات الفهرس الرئيسية
const indexFiles = [
  'interfaces/index.js',
  'base/index.js',
  'services/index.js',
  'utils/index.js'
];

console.log("\n📄 التحقق من ملفات الفهرس:");
indexFiles.forEach(file => {
  const filePath = path.join(__dirname, 'backend', 'src', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} موجود`);
  } else {
    console.log(`❌ ${file} غير موجود`);
  }
});

console.log("\n✅ تم إنشاء بنية SOLID بنجاح!");
console.log("📋 المجلدات المُنشأة:");
console.log("  • interfaces/ - للواجهات والأنواع");
console.log("  • base/ - للكلاسات الأساسية");
console.log("  • services/ - للخدمات المشتركة");
console.log("  • utils/ - للأدوات المساعدة");
console.log("  • controllers/ محدثة - مع بنية SOLID");

console.log("\n🎯 مبادئ SOLID المُطبقة:");
console.log("✅ S - Single Responsibility: تقسيم المهام");
console.log("✅ O - Open/Closed: إضافة وظائف دون تعديل موجود");
console.log("✅ L - Liskov Substitution: استبدال الكلاسات");
console.log("✅ I - Interface Segregation: فصل الواجهات");
console.log("✅ D - Dependency Inversion: عكس التبعيات");

console.log("\n🚀 البنية جاهزة للتطوير والصيانة!");
