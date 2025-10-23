import { useState, useEffect } from 'react';
import { Button } from "../../components/ui/Button";

// أنواع البيانات
interface MedicalReport {
  id: string;
  title: string;
  category: 'diagnostic' | 'laboratory' | 'imaging' | 'consultation' | 'surgical';
  doctor: {
    name: string;
    specialty: string;
    license?: string;
    clinic?: string;
  };
  date: string;
  status: 'completed' | 'pending' | 'draft';
  summary: string;
  findings: string[];
  recommendations: string[];
  attachments: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function PatientMedicalReports() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | MedicalReport['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // تحميل البيانات الوهمية
  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setReports([
        {
          id: "REP-2025-001",
          title: "تقرير التحاليل الدموية الشاملة",
          category: "laboratory",
          doctor: { 
            name: "د. أحمد محمد", 
            specialty: "أخصائي الباطنة", 
            license: "IM-1245", 
            clinic: "مستشفى الشفاء العام" 
          },
          date: "2025-04-15",
          status: "completed",
          summary: "جميع المؤشرات ضمن المعدل الطبيعي. لا توجد علامات على التهاب أو نقص فيتامينات.",
          findings: [
            "عدد كريات الدم الحمراء: طبيعي (4.7 مليون/ميكرو لتر)",
            "عدد كريات الدم البيضاء: طبيعي (7,200/ميكرو لتر)",
            "مستوى الهيموغلوبين: طبيعي (14.2 جم/ديسيلتر)",
            "عدد الصفائح الدموية: طبيعي (280,000/ميكرو لتر)"
          ],
          recommendations: [
            "متابعة دورية كل 6 أشهر",
            "الحفاظ على نظام غذائي متوازن",
            "ممارسة الرياضة بانتظام"
          ],
          attachments: 3,
          priority: "medium"
        },
        {
          id: "REP-2025-002",
          title: "تقرير الأشعة السينية للصدر",
          category: "imaging",
          doctor: { 
            name: "د. سارة علي", 
            specialty: "أخصائي الأشعة", 
            license: "RAD-3421", 
            clinic: "مركز التصوير الطبي" 
          },
          date: "2025-04-10",
          status: "completed",
          summary: "لا توجد تشوهات في البنية الرئوية. الأنسجة الرئوية واضحة.",
          findings: [
            "البنية الرئوية طبيعية",
            "لا توجد تجمعات سوائل",
            "القلب ضمن الحجم الطبيعي",
            "العظم الصدري سليم"
          ],
          recommendations: [
            "تكرار الفحص كل سنة",
            "تجنب التدخين والملوثات"
          ],
          attachments: 5,
          priority: "low"
        },
        {
          id: "REP-2025-003",
          title: "تقرير استشارة القلب",
          category: "consultation",
          doctor: { 
            name: "د. خالد عبدالله", 
            specialty: "أخصائي القلب", 
            license: "CAR-5678", 
            clinic: "مركز القلب المتقدم" 
          },
          date: "2025-04-05",
          status: "completed",
          summary: "وظائف القلب طبيعية. ضغط الدم ضمن المعدل المقبول.",
          findings: [
            "ضغط الدم: 130/85 مم زئبق",
            "نبض القلب: 72 نبضة في الدقيقة",
            "صدى القلب: وظائف طبيعية",
            "ECG: نتائج طبيعية"
          ],
          recommendations: [
            "متابعة ضغط الدم أسبوعياً",
            "تناول الأدوية الموصوفة",
            "تجنب التوتر والجهود المفرطة"
          ],
          attachments: 2,
          priority: "high"
        },
        {
          id: "REP-2025-004",
          title: "تقرير فحص الرؤية",
          category: "diagnostic",
          doctor: { 
            name: "د. نورا أحمد", 
            specialty: "أخصائي العيون", 
            license: "OPH-9012", 
            clinic: "عيادة الرؤية الواضحة" 
          },
          date: "2025-03-28",
          status: "completed",
          summary: "الرؤية طبيعية مع حاجة لتصحيح طفيف في قرب النظر.",
          findings: [
            "الرؤية البعيدة: 20/20",
            "الرؤية القريبة: 20/25",
            "الضغط داخل العين: طبيعي",
            "صحة الشبكية: جيدة"
          ],
          recommendations: [
            "استخدام نظارات للقراءة",
            "فحص سنوي للعين"
          ],
          attachments: 1,
          priority: "medium"
        },
        {
          id: "REP-2025-005",
          title: "تقرير تنظير المعدة",
          category: "diagnostic",
          doctor: { 
            name: "د. محمد حسن", 
            specialty: "أخصائي الجهاز الهضمي", 
            license: "GAS-3456", 
            clinic: "مركز الهضم المتقدم" 
          },
          date: "2025-03-20",
          status: "pending",
          summary: "قيد المراجعة النهائية من قبل الطبيب المختص.",
          findings: [
            "النتيجة الأولية تشير إلى التهاب خفيف في بطانة المعدة",
            "لا توجد قرحة أو نزيف",
            "ال蠕动 طبيعي"
          ],
          recommendations: [
            "في انتظار المراجعة النهائية",
            "الالتزام بالأدوية الموصوفة"
          ],
          attachments: 4,
          priority: "medium"
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // دالة لتحديد لون الفئة
  const getCategoryColor = (category: MedicalReport['category']) => {
    switch (category) {
      case 'diagnostic': return 'bg-blue-500/20 text-blue-300';
      case 'laboratory': return 'bg-green-500/20 text-green-300';
      case 'imaging': return 'bg-purple-500/20 text-purple-300';
      case 'consultation': return 'bg-orange-500/20 text-orange-300';
      case 'surgical': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // دالة لتحديد رمز الفئة
  const getCategoryIcon = (category: MedicalReport['category']) => {
    switch (category) {
      case 'diagnostic': return '🩺';
      case 'laboratory': return '🧬';
      case 'imaging': return '📷';
      case 'consultation': return '👨‍⚕️';
      case 'surgical': return '🔪';
      default: return '📋';
    }
  };

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: MedicalReport['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // دالة لتحديد لون الأولوية
  const getPriorityColor = (priority: MedicalReport['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'urgent': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // تصفية التقارير
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || report.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // تحميل الصفحة
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">جاري تحميل التقارير الطبية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            التقارير الطبية
          </h1>
          <p className="text-gray-400 mt-2">جميع التقارير الطبية الخاصة بك في مكان واحد</p>
        </div>

        {/* أدوات التحكم */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث في التقارير..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  🔍
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">جميع الفئات</option>
                <option value="diagnostic">تشخيصي</option>
                <option value="laboratory">مختبري</option>
                <option value="imaging">أشعة</option>
                <option value="consultation">استشارات</option>
                <option value="surgical">جراحي</option>
              </select>
              
              <div className="flex bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                <button 
                  className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-500/20' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  📊
                </button>
                <button 
                  className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-500/20' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  📋
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
              الكل: {reports.length}
            </div>
            <div className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-300">
              مكتمل: {reports.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
              قيد المراجعة: {reports.filter(r => r.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* عرض التقارير */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <div 
                key={report.id} 
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{report.title}</h3>
                      <p className="text-gray-400 text-sm">{report.doctor.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(report.category)}`}>
                        {getCategoryIcon(report.category)} {report.category === 'diagnostic' ? 'تشخيصي' : 
                          report.category === 'laboratory' ? 'مختبري' : 
                          report.category === 'imaging' ? 'أشعة' : 
                          report.category === 'consultation' ? 'استشارة' : 'جراحي'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                        {report.status === 'completed' ? 'مكتمل' : 
                         report.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-300 text-sm line-clamp-2">{report.summary}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {new Date(report.date).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'low' ? 'منخفضة' : 
                         report.priority === 'medium' ? 'متوسطة' : 
                         report.priority === 'high' ? 'عالية' : 'عاجلة'}
                      </span>
                      {report.attachments > 0 && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                          📎 {report.attachments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-gray-900/50 border-t border-white/10 flex justify-between">
                  <Button variant="ghost" size="sm">
                    تفاصيل
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm">
                      مشاركة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-right p-4 font-medium text-gray-400">التقرير</th>
                  <th className="text-right p-4 font-medium text-gray-400">الطبيب</th>
                  <th className="text-right p-4 font-medium text-gray-400">التاريخ</th>
                  <th className="text-right p-4 font-medium text-gray-400">الفئة</th>
                  <th className="text-right p-4 font-medium text-gray-400">الحالة</th>
                  <th className="text-right p-4 font-medium text-gray-400">الأولوية</th>
                  <th className="text-right p-4 font-medium text-gray-400">المرفقات</th>
                  <th className="text-right p-4 font-medium text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr 
                    key={report.id} 
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="p-4">
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-gray-400 line-clamp-1">{report.summary}</div>
                    </td>
                    <td className="p-4">
                      <div>{report.doctor.name}</div>
                      <div className="text-sm text-gray-400">{report.doctor.specialty}</div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(report.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(report.category)}`}>
                        {getCategoryIcon(report.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                        {report.status === 'completed' ? 'مكتمل' : 
                         report.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'low' ? 'منخفضة' : 
                         report.priority === 'medium' ? 'متوسطة' : 
                         report.priority === 'high' ? 'عالية' : 'عاجلة'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {report.attachments > 0 ? (
                        <span className="bg-gray-700 px-2 py-1 rounded-full text-sm">
                          📎 {report.attachments}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          PDF
                        </Button>
                        <Button variant="ghost" size="sm">
                          مشاركة
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">📋</div>
                <p>لا توجد تقارير مطابقة لمعايير البحث</p>
              </div>
            )}
          </div>
        )}

        {/* نافذة التفاصيل */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                    <p className="text-gray-400 mt-1">{selectedReport.doctor.name} - {selectedReport.doctor.specialty}</p>
                  </div>
                  <button 
                    className="text-2xl hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={() => setSelectedReport(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">تاريخ التقرير</p>
                    <p className="font-medium">{new Date(selectedReport.date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <p className={`font-medium ${getStatusColor(selectedReport.status).split(' ')[1]}`}>
                      {selectedReport.status === 'completed' ? 'مكتمل' : 
                       selectedReport.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">الأولوية</p>
                    <p className={`font-medium ${getPriorityColor(selectedReport.priority).split(' ')[1]}`}>
                      {selectedReport.priority === 'low' ? 'منخفضة' : 
                       selectedReport.priority === 'medium' ? 'متوسطة' : 
                       selectedReport.priority === 'high' ? 'عالية' : 'عاجلة'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3">ملخص التقرير</h3>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p>{selectedReport.summary}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3">النتائج والنتائج</h3>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <ul className="space-y-2">
                      {selectedReport.findings.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3">التوصيات</h3>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-400 mr-2">💡</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {selectedReport.attachments > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-3">المرفقات ({selectedReport.attachments})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[...Array(selectedReport.attachments)].map((_, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-xl p-4 aspect-square flex flex-col items-center justify-center">
                          <div className="text-3xl mb-2">📎</div>
                          <p className="text-sm text-center">مرفق {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    تنزيل PDF
                  </Button>
                  <Button variant="outline">
                    مشاركة التقرير
                  </Button>
                  <Button variant="ghost">
                    طباعة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ملاحظة تذييلية */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>جميع التقارير محدثة وآمنة وفقاً لمعايير الحماية الطبية</p>
        </div>
      </div>
    </div>
  );
}