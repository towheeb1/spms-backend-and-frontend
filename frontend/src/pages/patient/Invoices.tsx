import { useState, useEffect } from 'react';

// أنواع البيانات
interface Prescription {
  id: string;
  medication: string;
  doctor: string;
  date: string;
  dosage: string;
  duration: string;
  status: 'active' | 'completed' | 'pending';
  instructions: string;
}

interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'completed' | 'pending' | 'review';
  result: string;
  unit: string;
  referenceRange: string;
  notes?: string;
  trend?: { date: string; value: number }[];
}

interface MedicationHistory {
  id: string;
  medication: string;
  startDate: string;
  endDate: string;
  dosage: string;
  status: 'completed' | 'ongoing';
}

export function PatientMedicalRecords() {
  const [activeTab, setActiveTab] = useState(0);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات الوهمية
  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setPrescriptions([
        {
          id: "RX-2025-001",
          medication: "أموكسيسيلين",
          doctor: "د. أحمد محمد",
          date: "2025-04-15",
          dosage: "500 ملغ كل 8 ساعات",
          duration: "7 أيام",
          status: "active",
          instructions: "تناول مع الطعام لتجنب اضطراب المعدة"
        },
        {
          id: "RX-2025-002",
          medication: "باراسيتامول",
          doctor: "د. سارة علي",
          date: "2025-03-22",
          dosage: "500 ملغ عند الحاجة",
          duration: "5 أيام",
          status: "completed",
          instructions: "لا تتجاوز الجرعة المحددة"
        },
        {
          id: "RX-2025-003",
          medication: "أتورفاستاتين",
          doctor: "د. خالد عبدالله",
          date: "2025-02-10",
          dosage: "20 ملغ يومياً",
          duration: "مستمر",
          status: "active",
          instructions: "تناول في المساء قبل النوم"
        }
      ]);

      setLabResults([
        {
          id: "LAB-2025-001",
          testName: "تحاليل الدم الكامل (CBC)",
          date: "2025-04-10",
          status: "completed",
          result: "طبيعي",
          unit: "",
          referenceRange: "طبيعي",
          notes: "جميع المؤشرات ضمن المعدل الطبيعي",
          trend: [
            { date: "2024-01", value: 12.5 },
            { date: "2024-04", value: 13.2 },
            { date: "2024-07", value: 12.8 },
            { date: "2024-10", value: 13.0 },
            { date: "2025-01", value: 13.1 },
            { date: "2025-04", value: 12.9 }
          ]
        },
        {
          id: "LAB-2025-002",
          testName: "سكر الدم العشوائي",
          date: "2025-04-08",
          status: "completed",
          result: "95",
          unit: "ملغ/ديسيلتر",
          referenceRange: "70-100",
          notes: "مستوى السكر طبيعي"
        },
        {
          id: "LAB-2025-003",
          testName: "كوليسترول الكلي",
          date: "2025-04-05",
          status: "completed",
          result: "180",
          unit: "ملغ/ديسيلتر",
          referenceRange: "<200",
          notes: "مستوى الكوليسترول مقبول"
        },
        {
          id: "LAB-2025-004",
          testName: "وظائف الكلى",
          date: "2025-03-15",
          status: "completed",
          result: "طبيعي",
          unit: "",
          referenceRange: "طبيعي",
          notes: "وظائف الكلى سليمة"
        }
      ]);

      setMedicationHistory([
        {
          id: "HIST-2024-001",
          medication: "أموكسيسيلين",
          startDate: "2024-03-15",
          endDate: "2024-03-22",
          dosage: "500 ملغ كل 8 ساعات",
          status: "completed"
        },
        {
          id: "HIST-2024-002",
          medication: "إيبوبروفين",
          startDate: "2024-05-10",
          endDate: "2024-05-15",
          dosage: "400 ملغ عند الحاجة",
          status: "completed"
        },
        {
          id: "HIST-2025-001",
          medication: "أتورفاستاتين",
          startDate: "2025-02-10",
          endDate: "الآن",
          dosage: "20 ملغ يومياً",
          status: "ongoing"
        }
      ]);

      setLoading(false);
    }, 800);
  }, []);

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'review': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // دالة لتحديد رمز الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔵';
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'review': return '🔍';
      default: return '🔹';
    }
  };

  // مكون بسيط للرسم البياني
  const SimpleLineChart = ({ data }: { data: { date: string; value: number }[] }) => {
    if (!data || data.length === 0) return null;

    // حساب القيم الدنيا والقصوى
    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    return (
      <div className="h-40 w-full relative">
        <div className="absolute inset-0 flex items-end">
          {data.map((point, index) => {
            const heightPercent = ((point.value - minVal) / range) * 100;
            return (
              <div 
                key={index}
                className="flex-1 flex flex-col items-center mx-0.5"
              >
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                {index % 2 === 0 && (
                  <div className="text-xs text-gray-500 mt-1 transform -translate-x-1/2">
                    {point.date}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // تحميل الصفحة
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">جاري تحميل سجلاتك الطبية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            السجلات الطبية
          </h1>
          <p className="text-gray-400 mt-2">جميع التحاليل والوصفات الطبية الخاصة بك في مكان واحد</p>
        </div>

        {/* علامات التبويب */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden mb-8">
          <div className="flex border-b border-white/10">
            <button 
              className={`px-6 py-4 font-medium transition-all ${activeTab === 0 ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab(0)}
            >
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span>الوصفات الطبية</span>
              </div>
            </button>
            <button 
              className={`px-6 py-4 font-medium transition-all ${activeTab === 1 ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab(1)}
            >
              <div className="flex items-center gap-2">
                <span>🧬</span>
                <span>التحاليل الطبية</span>
              </div>
            </button>
            <button 
              className={`px-6 py-4 font-medium transition-all ${activeTab === 2 ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab(2)}
            >
              <div className="flex items-center gap-2">
                <span>💊</span>
                <span>سجل الأدوية</span>
              </div>
            </button>
          </div>

          {/* علامة التبويب: الوصفات الطبية */}
          {activeTab === 0 && (
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* قائمة الوصفات */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">📋</span>
                    <span>الوصفات الحالية</span>
                  </h2>
                  
                  {prescriptions.filter(p => p.status === 'active').length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.filter(p => p.status === 'active').map(prescription => (
                        <div key={prescription.id} className="bg-gray-700/50 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-blue-300">{prescription.medication}</h3>
                              <p className="text-gray-400 text-sm">{prescription.doctor} • {prescription.date}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(prescription.status)}`}>
                              {getStatusIcon(prescription.status)} {prescription.status === 'active' ? 'نشطة' : prescription.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'}
                            </span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">الجرعة</p>
                              <p>{prescription.dosage}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">المدة</p>
                              <p>{prescription.duration}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-gray-500 text-sm">التعليمات</p>
                            <p>{prescription.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <div className="text-5xl mb-3">💊</div>
                      <p>لا توجد وصفات طبية نشطة حالياً</p>
                    </div>
                  )}
                </div>
                
                {/* الوصفات السابقة */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span>الوصفات السابقة</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {prescriptions.filter(p => p.status === 'completed').map(prescription => (
                      <div key={prescription.id} className="bg-gray-700/50 rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-green-300">{prescription.medication}</h3>
                            <p className="text-gray-400 text-sm">{prescription.doctor} • {prescription.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)} مكتملة
                          </span>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">الجرعة</p>
                            <p>{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">المدة</p>
                            <p>{prescription.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* علامة التبويب: التحاليل الطبية */}
          {activeTab === 1 && (
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* قائمة التحاليل */}
                <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-400">🧬</span>
                    <span>نتائج التحاليل الطبية</span>
                  </h2>
                  
                  <div className="space-y-5">
                    {labResults.map(lab => (
                      <div key={lab.id} className="bg-gray-700/50 rounded-xl p-5 border border-white/10 hover:border-purple-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-purple-300">{lab.testName}</h3>
                            <p className="text-gray-400 text-sm">{lab.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(lab.status)}`}>
                            {getStatusIcon(lab.status)} {lab.status === 'completed' ? 'جاهزة' : lab.status === 'pending' ? 'قيد الانتظار' : 'قيد المراجعة'}
                          </span>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 text-sm">النتيجة</p>
                            <p className={`text-lg font-bold ${lab.result === 'طبيعي' ? 'text-green-400' : lab.result === 'غير طبيعي' ? 'text-red-400' : 'text-white'}`}>
                              {lab.result}
                            </p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 text-sm">الوحدة</p>
                            <p>{lab.unit || '-'}</p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 text-sm">النطاق المرجعي</p>
                            <p>{lab.referenceRange}</p>
                          </div>
                        </div>
                        
                        {lab.notes && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-gray-500 text-sm">ملاحظات الطبيب</p>
                            <p>{lab.notes}</p>
                          </div>
                        )}
                        
                        {lab.trend && (
                          <div className="mt-5">
                            <p className="text-gray-500 text-sm mb-2">التطور على مر الزمن</p>
                            <SimpleLineChart data={lab.trend} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* ملخص التحاليل */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-400">📊</span>
                    <span>ملخص التحاليل</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400">التحاليل الجاهزة</p>
                          <p className="text-2xl font-bold text-green-400">
                            {labResults.filter(l => l.status === 'completed').length}
                          </p>
                        </div>
                        <div className="text-3xl">✅</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400">قيد المراجعة</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {labResults.filter(l => l.status === 'review').length}
                          </p>
                        </div>
                        <div className="text-3xl">🔍</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400">التحاليل الطبيعية</p>
                          <p className="text-2xl font-bold text-green-400">
                            {labResults.filter(l => l.result === 'طبيعي').length}
                          </p>
                        </div>
                        <div className="text-3xl">🟢</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400">التحاليل غير الطبيعية</p>
                          <p className="text-2xl font-bold text-red-400">
                            {labResults.filter(l => l.result === 'غير طبيعي').length}
                          </p>
                        </div>
                        <div className="text-3xl">🔴</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <h3 className="font-bold mb-3">أحدث التحاليل</h3>
                      <div className="space-y-3">
                        {labResults.slice(0, 3).map(lab => (
                          <div key={lab.id} className="flex items-center gap-3">
                            <div className="bg-gray-700 p-2 rounded-lg">
                              <span className="text-purple-400">🧬</span>
                            </div>
                            <div>
                              <p className="font-medium">{lab.testName}</p>
                              <p className="text-sm text-gray-400">{lab.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* علامة التبويب: سجل الأدوية */}
          {activeTab === 2 && (
            <div className="p-4 md:p-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-green-400">💊</span>
                  <span>سجل الأدوية</span>
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="pb-3 font-medium text-gray-400">الدواء</th>
                        <th className="pb-3 font-medium text-gray-400">الجرعة</th>
                        <th className="pb-3 font-medium text-gray-400">تاريخ البدء</th>
                        <th className="pb-3 font-medium text-gray-400">تاريخ الانتهاء</th>
                        <th className="pb-3 font-medium text-gray-400">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicationHistory.map(med => (
                        <tr key={med.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 font-medium">{med.medication}</td>
                          <td className="py-4">{med.dosage}</td>
                          <td className="py-4">{med.startDate}</td>
                          <td className="py-4">{med.endDate}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${med.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {med.status === 'completed' ? 'مكتمل' : 'جاري'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {medicationHistory.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <div className="text-5xl mb-3">💊</div>
                    <p>لا توجد سجلات أدوية</p>
                  </div>
                )}
              </div>
              
              {/* مخطط زمني للأدوية */}
              <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-400">📅</span>
                  <span>الاستخدام الزمني للأدوية</span>
                </h2>
                
                <div className="relative pt-8">
                  {/* خط الزمن */}
                  <div className="absolute right-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transform translate-x-1/2"></div>
                  
                  <div className="space-y-12">
                    {medicationHistory.map((med, index) => (
                      <div key={med.id} className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                          <div className="bg-gray-700/50 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg">{med.medication}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${med.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                {med.status === 'completed' ? 'مكتمل' : 'جاري'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{med.startDate} - {med.endDate}</p>
                            <p className="mt-2">{med.dosage}</p>
                          </div>
                        </div>
                        
                        {/* نقطة الزمن */}
                        <div className="absolute right-1/2 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-gray-900 transform translate-x-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* قسم الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300">الوصفات النشطة</p>
                <p className="text-3xl font-bold mt-1">
                  {prescriptions.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300">التحاليل الجاهزة</p>
                <p className="text-3xl font-bold mt-1">
                  {labResults.filter(l => l.status === 'completed').length}
                </p>
              </div>
              <div className="text-3xl">🧬</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-700/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300">الأدوية المستمرة</p>
                <p className="text-3xl font-bold mt-1">
                  {medicationHistory.filter(m => m.status === 'ongoing').length}
                </p>
              </div>
              <div className="text-3xl">💊</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/30 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300">التحاليل الطبيعية</p>
                <p className="text-3xl font-bold mt-1">
                  {labResults.filter(l => l.result === 'طبيعي').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>
        
        {/* ملاحظة تذييلية */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>جميع المعلومات محدثة وآمنة وفقاً لمعايير الحماية الطبية</p>
        </div>
      </div>
    </div>
  );
}