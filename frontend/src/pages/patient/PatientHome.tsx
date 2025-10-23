import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export   function PatientHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تحديث الوقت كل دقيقة
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // تحديد التحية حسب الوقت
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('صباح الخير');
    } else if (hours < 18) {
      setGreeting('مساء الخير');
    } else {
      setGreeting('مساء الخير');
    }

    // محاكاة تحميل البيانات
    loadPatientData();

    return () => clearInterval(timer);
  }, []);

  async function loadPatientData() {
    try {
      setLoading(true);
      // هنا يمكن جلب البيانات من API
      // const appointments = await api.get('/patient/appointments');
      // const prescriptions = await api.get('/patient/prescriptions/recent');
      
      // بيانات تجريبية
      setUpcomingAppointments([
        { id: 1, doctor: 'د. أحمد محمد', specialty: 'أمراض القلب', date: '2024-01-15', time: '10:30 صباحاً' },
        { id: 2, doctor: 'د. فاطمة علي', specialty: 'الجلدية', date: '2024-01-18', time: '2:00 مساءً' }
      ]);
      
      setRecentPrescriptions([
        { id: 1, doctor: 'د. أحمد محمد', date: '2024-01-10', status: 'مفعلة' },
        { id: 2, doctor: 'د. سارة خالد', date: '2024-01-05', status: 'منتهية' }
      ]);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  }

  const groups = [
    { 
      title: "الوصفات الطبية", 
      items: ["عرض الوصفات", "إعادة الطلب", "تتبع الحالة", "QR Code"], 
      to: "/patient/prescriptions",
      icon: "📋",
      color: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30"
    },
    { 
      title: "الطلبات", 
      items: ["طلب جديد", "قيد التنفيذ", "تم التسليم", "تفاصيل الطلب"], 
      to: "/patient/orders",
      icon: "🛒",
      color: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30"
    },
    { 
      title: "الفواتير والمدفوعات", 
      items: ["سجل الفواتير", "خيارات الدفع", "التحويلات البنكية", "الإيصالات"], 
      to: "/patient/invoices",
      icon: "💳",
      color: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500/30"
    },
    { 
      title: "الملف الشخصي", 
      items: ["بياناتي الشخصية", "العناوين", "بطاقة التأمين", "المستندات"], 
      to: "/patient/profile",
      icon: "👤",
      color: "from-indigo-500/20 to-indigo-600/20",
      border: "border-indigo-500/30"
    },
    { 
      title: "الصيدليات القريبة", 
      items: ["بحث بالخريطة", "المسار ووقت الوصول", "التقييمات", "الخدمات"], 
      to: "/patient/pharmacies",
      icon: "📍",
      color: "from-orange-500/20 to-orange-600/20",
      border: "border-orange-500/30"
    },
    { 
      title: "التنبيهات والإعدادات", 
      items: ["تذكيرات الجرعات", "الخصوصية والأمان", "الإشعارات", "التفضيلات"], 
      to: "/patient/settings",
      icon: "⚙️",
      color: "from-gray-500/20 to-gray-600/20",
      border: "border-gray-500/30"
    }
  ];

  const quickActions = [
    { title: "طلب دواء جديد", icon: "💊", to: "/patient/prescriptions/new", color: "bg-blue-600/90" },
    { title: "حجز موعد", icon: "📅", to: "/patient/appointments/book", color: "bg-green-600/90" },
    { title: "استشارة طبية", icon: "💬", to: "/patient/consultations", color: "bg-purple-600/90" },
    { title: ".scan QR", icon: "📱", to: "/patient/qr-scanner", color: "bg-orange-600/90" }
  ];

  return (
    <div className="grid gap-6">
      {/* الترحيب والوقت */}
      <div className="card rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting}، <span className="text-blue-300">  توهيب الجعفري</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {currentTime.toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {currentTime.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-gray-400">التوقيت المحلي</div>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link 
            key={index}
            to={action.to}
            className={`${action.color} rounded-2xl p-4 text-white hover:opacity-90 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-2`}
          >
            <div className="text-2xl">{action.icon}</div>
            <div className="text-sm font-medium text-center">{action.title}</div>
          </Link>
        ))}
      </div>

      {/* المواعيد القادمة والوصفات الحديثة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المواعيد القادمة */}
        <div className="card rounded-2xl p-5 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>📅</span>
              المواعيد القادمة
            </h2>
            <Link 
              to="/patient/appointments" 
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              عرض الكل
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{appointment.doctor}</div>
                      <div className="text-sm text-blue-300">{appointment.specialty}</div>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                      قادم
                    </span>
                  </div>
                  <div className="text-sm opacity-80 mt-2">
                    {appointment.date} • {appointment.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p>لا توجد مواعيد قادمة</p>
            </div>
          )}
        </div>

        {/* الوصفات الحديثة */}
        <div className="card rounded-2xl p-5 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>📋</span>
              الوصفات الحديثة
            </h2>
            <Link 
              to="/patient/prescriptions" 
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              عرض الكل
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : recentPrescriptions.length > 0 ? (
            <div className="space-y-3">
              {recentPrescriptions.map((prescription) => (
                <div 
                  key={prescription.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">وصفة من {prescription.doctor}</div>
                      <div className="text-sm opacity-80">تاريخ الإصدار: {prescription.date}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prescription.status === 'مفعلة' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors">
                      عرض التفاصيل
                    </button>
                    <button className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      إعادة الطلب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>لا توجد وصفات حديثة</p>
            </div>
          )}
        </div>
      </div>

      {/* الخدمات الرئيسية */}
      <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-semibold mb-6">الخدمات الرئيسية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <Link 
              key={index}
              to={group.to}
              className={`rounded-2xl p-5 bg-gradient-to-br ${group.color} border ${group.border} hover:scale-[1.02] transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{group.icon}</div>
                <div className="font-semibold">{group.title}</div>
              </div>
              <ul className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="text-sm opacity-90 flex items-center gap-2 before:content-['•'] before:text-blue-400"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-blue-300 flex items-center gap-1">
                <span>الدخول للخدمة</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-green-300">الوصفات النشطة</div>
        </div>
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="text-2xl font-bold">5</div>
          <div className="text-sm text-blue-300">المواعيد القادمة</div>
        </div>
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-purple-300">الطلبات قيد التنفيذ</div>
        </div>
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-orange-300">الإشعارات الجديدة</div>
        </div>
      </div>

      {/* التنبيهات المهمة */}
      <div className="card rounded-2xl p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">⚠️</div>
          <h3 className="text-lg font-semibold">تنبيهات مهمة</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="font-medium">تذكير بموعد الطبيب</div>
            <div className="text-sm opacity-80 mt-1">لديك موعد مع د. أحمد محمد غداً في الساعة 10:30 صباحاً</div>
            <div className="text-xs text-yellow-300 mt-2">قبل 1 يوم</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="font-medium">تجديد وصفة</div>
            <div className="text-sm opacity-80 mt-1">وصفة الدواء الخاص بضغط الدم تحتاج إلى تجديد</div>
            <div className="text-xs text-yellow-300 mt-2">قبل 3 أيام</div>
          </div>
        </div>
      </div>
    </div>
  );
}