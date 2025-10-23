import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function DoctorVisits() {
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    filterAndSortVisits();
  }, [visits, searchTerm, dateFilter, statusFilter, sortBy, sortOrder]);

  async function loadVisits() {
    try {
      setLoading(true);
      const response = await api.get("/doctor/visits?doctor_id=1");
      setVisits(response.data.list || []);
    } catch (error) {
      console.error("Error loading visits:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortVisits() {
    let filtered = [...visits];

    // تصفية بالبحث
    if (searchTerm) {
      filtered = filtered.filter(visit => 
        visit.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.visit_reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية بالتاريخ
    if (dateFilter) {
      filtered = filtered.filter(visit => 
        new Date(visit.visit_date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    // تصفية بالحالة
    if (statusFilter !== "all") {
      filtered = filtered.filter(visit => visit.status === statusFilter);
    }

    // فرز
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.visit_date);
          bValue = new Date(b.visit_date);
          break;
        case "patient":
          aValue = a.patient_name || "";
          bValue = b.patient_name || "";
          break;
        case "reason":
          aValue = a.visit_reason || "";
          bValue = b.visit_reason || "";
          break;
        default:
          aValue = new Date(a.visit_date);
          bValue = new Date(b.visit_date);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredVisits(filtered);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">مكتمل</span>;
      case "pending":
        return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">قيد الانتظار</span>;
      case "cancelled":
        return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">ملغى</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">غير محدد</span>;
    }
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case "high":
        return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">عالية</span>;
      case "medium":
        return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">متوسطة</span>;
      case "low":
        return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">منخفضة</span>;
      default:
        return null;
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  }

  function getVisitIcon(reason: string) {
    if (!reason) return "📋";
    
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("فحص") || lowerReason.includes("checkup")) return "🩺";
    if (lowerReason.includes("متابعة") || lowerReason.includes("follow")) return "🔄";
    if (lowerReason.includes("طوارئ") || lowerReason.includes("emergency")) return "🚨";
    if (lowerReason.includes("استشارة") || lowerReason.includes("consult")) return "💬";
    return "📅";
  }

  return (
    <div className="grid gap-6">
      {/* العنوان وشريط التحكم */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">سجل الزيارات الطبية</h1>
          <p className="text-gray-400 mt-1">إدارة وتنظيم جميع زيارات المرضى</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400">
            إجمالي الزيارات: <span className="font-semibold text-white">{filteredVisits.length}</span>
          </div>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="card rounded-2xl p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* بحث */}
          <div className="lg:col-span-2">
            <label className="text-xs opacity-70 block mb-2">بحث</label>
            <div className="relative">
              <input
                type="text"
                placeholder="بحث باسم المريض أو سبب الزيارة..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* تصفية التاريخ */}
          <div>
            <label className="text-xs opacity-70 block mb-2">التاريخ</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* تصفية الحالة */}
          <div>
            <label className="text-xs opacity-70 block mb-2">الحالة</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتمل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>

          {/* ترتيب */}
          <div>
            <label className="text-xs opacity-70 block mb-2">ترتيب حسب</label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">التاريخ</option>
                <option value="patient">اسم المريض</option>
                <option value="reason">سبب الزيارة</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* قائمة الزيارات */}
      {!loading && (
        <div className="grid gap-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <div 
                key={visit.visit_id} 
                className="card rounded-2xl p-5 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* المعلومات الأساسية */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-1">
                        {getVisitIcon(visit.visit_reason)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{visit.patient_name || "مريض مجهول"}</h3>
                          {visit.priority && getPriorityBadge(visit.priority)}
                          {visit.status && getStatusBadge(visit.status)}
                        </div>
                        <p className="text-gray-300 mb-2">{visit.visit_reason || "لا يوجد سبب محدد"}</p>
                        {visit.notes && (
                          <p className="text-sm text-gray-400 bg-gray-800/50 rounded-lg p-2">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* التفاصيل الجانبية */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center gap-4 min-w-fit">
                    <div className="text-center sm:text-right lg:text-center xl:text-right">
                      <div className="text-sm text-gray-400">التاريخ والوقت</div>
                      <div className="font-medium">{formatDateTime(visit.visit_date)}</div>
                    </div>
                    
                    {visit.duration && (
                      <div className="text-center">
                        <div className="text-sm text-gray-400">المدة</div>
                        <div className="font-medium">{visit.duration} دقيقة</div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors text-sm">
                        تفاصيل
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                        تعديل
                      </button>
                    </div>
                  </div>
                </div>

                {/* شريط المعلومات الإضافية */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
                  {visit.doctor_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">👨‍⚕️</span>
                      <span>الطبيب: {visit.doctor_name}</span>
                    </div>
                  )}
                  {visit.department && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🏥</span>
                      <span>{visit.department}</span>
                    </div>
                  )}
                  {visit.room && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🚪</span>
                      <span>الغرفة {visit.room}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card rounded-2xl p-12 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">لا توجد زيارات</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || dateFilter || statusFilter !== "all" 
                  ? "لا توجد زيارات تطابق معايير البحث" 
                  : "لا توجد زيارات مسجلة حتى الآن"}
              </p>
              <button 
                className="px-6 py-3 rounded-xl bg-blue-600/90 hover:bg-blue-600 transition-colors font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setStatusFilter("all");
                }}
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      )}

      {/* إحصائيات سريعة */}
      {!loading && filteredVisits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card rounded-2xl p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
            <div className="text-2xl font-bold">{filteredVisits.filter(v => v.status === "completed").length}</div>
            <div className="text-sm text-green-300">زيارات مكتملة</div>
          </div>
          <div className="card rounded-2xl p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
            <div className="text-2xl font-bold">{filteredVisits.filter(v => v.status === "pending").length}</div>
            <div className="text-sm text-yellow-300">قيد الانتظار</div>
          </div>
          <div className="card rounded-2xl p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
            <div className="text-2xl font-bold">{filteredVisits.filter(v => v.status === "cancelled").length}</div>
            <div className="text-sm text-red-300">ملغاة</div>
          </div>
          <div className="card rounded-2xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <div className="text-2xl font-bold">{filteredVisits.length}</div>
            <div className="text-sm text-blue-300">إجمالي الزيارات</div>
          </div>
        </div>
      )}
    </div>
  );
}