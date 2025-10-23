import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function DoctorLabs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLab, setNewLab] = useState({
    name: "",
    file: null as File | null,
    importance: "medium",
    notes: ""
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempLab, setTempLab] = useState<any | null>(null); // للتحليل المؤقت

  useEffect(() => {
    loadLabs();
  }, []);

  async function loadLabs() {
    try {
      const response = await api.get("/doctor/labs?doctor_id=1&sort=importance,time");
      setLabs(response.data.list || []);
    } catch (error) {
      console.error("Error loading labs:", error);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setNewLab(prev => ({ ...prev, file }));
      
      // عرض معاينة للصورة
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newLab.name || !newLab.file) return;

    setUploading(true);
    
    // تكوين البيانات المؤقتة للتحليل
    const tempLabData = {
      id: Date.now(), // استخدام توقيت النظام كمعرّف مؤقت
      name: newLab.name,
      file_name: newLab.file?.name || "",
      file_url: previewUrl || "",
      importance: newLab.importance,
      notes: newLab.notes,
      upload_time: new Date().toISOString(),
      status: "temporary" // حالة مؤقتة
    };

    // إضافة التحليل المؤقت إلى القائمة
    setTempLab(tempLabData);
    
    // إعادة تعيين النموذج
    setNewLab({
      name: "",
      file: null,
      importance: "medium",
      notes: ""
    });
    setPreviewUrl(null);
    setShowAddForm(false);

    // تنفيذ الرفع الفعلي بعد فترة قصيرة (مثلاً 2 ثانية)
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('name', newLab.name);
        formData.append('file', newLab.file!);
        formData.append('importance', newLab.importance);
        formData.append('notes', newLab.notes);
        formData.append('upload_time', new Date().toISOString());

        const response = await api.post("/doctor/labs", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // تحديث القائمة الكاملة
          await loadLabs();
          // حذف التحليل المؤقت من القائمة
          setTempLab(null);
        }
      } catch (error) {
        console.error("Error uploading lab:", error);
        // إذا فشل الرفع، يمكن أن تُظهر رسالة خطأ
      } finally {
        setUploading(false);
      }
    }, 2000);
  }

  function getImportanceBadge(importance: string) {
    switch (importance) {
      case 'high':
        return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">عالي</span>;
      case 'medium':
        return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">متوسط</span>;
      case 'low':
        return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">منخفض</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">غير محدد</span>;
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">نتائج التحاليل</h1>
        <button 
          className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 flex items-center gap-2 transition-colors"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <span>➕</span>
          {showAddForm ? 'إلغاء' : 'تحليل جديد'}
        </button>
      </div>

      {/* نموذج إضافة تحليل جديد */}
      {showAddForm && (
        <div className="card rounded-2xl p-4 bg-blue-500/10 border border-blue-500/20">
          <h2 className="text-lg font-semibold mb-4">إضافة تحليل جديد</h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm opacity-80 mb-2">اسم التحليل *</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50"
                placeholder="مثال: تحليل الدم الكامل"
                value={newLab.name}
                onChange={e => setNewLab(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm opacity-80 mb-2">الملف (صورة أو PDF) *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50"
                onChange={handleFileChange}
                required
              />
              {previewUrl && (
                <div className="mt-2">
                  <img 
                    src={previewUrl} 
                    alt="معاينة" 
                    className="max-w-xs max-h-40 rounded-lg border border-white/20"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm opacity-80 mb-2">أهمية التحليل</label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50"
                value={newLab.importance}
                onChange={e => setNewLab(prev => ({ ...prev, importance: e.target.value }))}
              >
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm opacity-80 mb-2">ملاحظات</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50 h-20"
                placeholder="ملاحظات إضافية..."
                value={newLab.notes}
                onChange={e => setNewLab(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-green-600/90 hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                disabled={uploading || !newLab.name || !newLab.file}
              >
                {uploading ? 'جاري التحميل...' : '➕ إضافة التحليل'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gray-600/80 hover:bg-gray-600"
                onClick={() => setShowAddForm(false)}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول التحاليل السابقة */}
      <div className="card rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">التحاليل السابقة</h2>
        
        {labs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3 text-sm font-medium">الاسم</th>
                  <th className="pb-3 text-sm font-medium">الأهمية</th>
                  <th className="pb-3 text-sm font-medium">التاريخ</th>
                  <th className="pb-3 text-sm font-medium">الملف</th>
                  <th className="pb-3 text-sm font-medium">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {labs.map((lab) => (
                  <tr key={lab.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <div className="font-medium">{lab.name}</div>
                    </td>
                    <td className="py-3">
                      {getImportanceBadge(lab.importance)}
                    </td>
                    <td className="py-3 text-sm opacity-80">
                      {formatDateTime(lab.upload_time)}
                    </td>
                    <td className="py-3">
                      <a 
                        href={lab.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                      >
                        <span>{getFileIcon(lab.file_name)}</span>
                        {lab.file_name}
                      </a>
                    </td>
                    <td className="py-3 text-sm opacity-80 max-w-xs">
                      {lab.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 opacity-70">
            <div className="text-4xl mb-2">📋</div>
            <p>لا توجد تحاليل سابقة</p>
            <button 
              className="mt-3 text-blue-400 hover:text-blue-300"
              onClick={() => setShowAddForm(true)}
            >
              إضافة تحليل جديد
            </button>
          </div>
        )}
      </div>

      {/* التحليل المؤقت المضاف */}
      {tempLab && (
        <div className="card rounded-2xl p-4 border border-blue-500/30 bg-blue-500/5 animate-fade-in">
          <div className="flex justify-between items-start mb-3">
            <div className="font-medium">{tempLab.name}</div>
            <div className="text-xs text-blue-400">مؤقت</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-70">الملف:</span>
              <div className="mt-1">
                <a 
                  href={tempLab.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>{getFileIcon(tempLab.file_name)}</span>
                  {tempLab.file_name}
                </a>
              </div>
            </div>
            
            <div>
              <span className="opacity-70">الأهمية:</span>
              <div className="mt-1">{getImportanceBadge(tempLab.importance)}</div>
            </div>
            
            <div>
              <span className="opacity-70">التاريخ:</span>
              <div className="mt-1">{formatDateTime(tempLab.upload_time)}</div>
            </div>
            
            <div>
              <span className="opacity-70">الملاحظات:</span>
              <div className="mt-1">{tempLab.notes || 'لا يوجد'}</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-blue-400">
            يتم رفع التحليل الآن... سيرى في القائمة بعد لحظات.
          </div>
        </div>
      )}

      {/* عرض التحاليل كقائمة على الأجهزة المحمولة */}
      <div className="md:hidden">
        <div className="space-y-3">
          {labs.map((lab) => (
            <div key={lab.id} className="card rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{lab.name}</div>
                {getImportanceBadge(lab.importance)}
              </div>
              <div className="text-xs opacity-70 mb-2">
                {formatDateTime(lab.upload_time)}
              </div>
              <div className="mb-2">
                <a 
                  href={lab.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                >
                  <span>{getFileIcon(lab.file_name)}</span>
                  {lab.file_name}
                </a>
              </div>
              {lab.notes && (
                <div className="text-sm opacity-80">
                  {lab.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}