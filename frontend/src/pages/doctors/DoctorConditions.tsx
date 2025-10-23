import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  searchPatients, 
  listConditions, 
  getPatientConditions, 
  addPatientCondition, 
  updatePatientCondition, 
  deletePatientCondition,
  getExpectedPatients,
  getPatientReports,
  getPatientNotes
} from "../../services/doctorApi";

export default function DoctorConditions() {
  const navigate = useNavigate();
  const [expectedPatients, setExpectedPatients] = useState<{id:number; full_name:string; phone?:string}[]>([]);
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<{id:number; full_name:string; phone?:string}[]>([]);
  const [pid, setPid] = useState<number|undefined>();
  const [conds, setConds] = useState<{id:number; name:string}[]>([]);
  const [rows, setRows] = useState<{id:number; condition_id:number; name:string; diagnosed_date:string|null; notes?:string|null}[]>([]);
  const [form, setForm] = useState<{pcid?:number; condition_id?:number; diagnosed_date?:string; notes?:string}>({});
  const [reports, setReports] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [showReports, setShowReports] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const deb = useRef<number|undefined>();

  useEffect(()=>{ // تحميل المرجع
    listConditions().then(setConds);
    loadExpectedPatients();
  },[]);

  useEffect(()=>{ // بحث مرضى
    if (deb.current) clearTimeout(deb.current);
    deb.current = window.setTimeout(()=>{
      if (q.trim().length>=2) searchPatients(q).then(setPatients);
      else setPatients([]);
    },250);
  },[q]);

  useEffect(()=>{ // تحميل أمراض المريض
    if (!pid) { 
      setRows([]); 
      setReports([]);
      setNotes([]);
      return; 
    }
    getPatientConditions(pid).then(setRows);
    loadPatientData(pid);
    setForm({});
  },[pid]);

  const selectedPatient = useMemo(()=>patients.find(p=>p.id===pid), [patients,pid]);

  async function loadExpectedPatients() {
    try {
      const data = await getExpectedPatients();
      setExpectedPatients(data);
    } catch (error) {
      console.error("Error loading expected patients:", error);
    }
  }

  async function loadPatientData(patientId: number) {
    try {
      const [reportsData, notesData] = await Promise.all([
        getPatientReports(patientId),
        getPatientNotes(patientId)
      ]);
      setReports(reportsData);
      setNotes(notesData);
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  }

  async function save() {
    if (!pid || !form.condition_id) return;
    try {
      if (form.pcid) {
        await updatePatientCondition(pid, form.pcid, { 
          condition_id: form.condition_id, 
          diagnosed_date: form.diagnosed_date, 
          notes: form.notes 
        });
      } else {
        await addPatientCondition(pid, { 
          condition_id: form.condition_id, 
          diagnosed_date: form.diagnosed_date, 
          notes: form.notes 
        });
      }
      const updatedRows = await getPatientConditions(pid);
      setRows(updatedRows);
      setForm({});
    } catch (error) {
      console.error("Error saving condition:", error);
    }
  }

  async function remove(pcid:number) {
    if (!pid) return;
    try {
      await deletePatientCondition(pid, pcid);
      setRows(rows.filter(r=>r.id!==pcid));
    } catch (error) {
      console.error("Error deleting condition:", error);
    }
  }

  const handleAddNewPatient = () => {
    navigate("/doctor/patients/new");
  };

  const handleViewReports = () => {
    if (pid) {
      navigate(`/doctor/patients/${pid}/reports`);
    }
  };

  const handleAddReport = () => {
    if (pid) {
      navigate(`/doctor/patients/${pid}/reports/add`);
    }
  };

  const handleViewAnalysis = () => {
    if (pid) {
      navigate(`/doctor/patients/${pid}/analysis`);
    }
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">ملف المريض</h1>

      {/* اختيار المريض - قائمة منسدلة للمتوقعين + بحث */}
      <div className="card rounded-2xl p-4">
        <div className="text-sm opacity-80 mb-2">اختر مريضاً من القائمة أو ابحث</div>
        <div className="flex gap-2 flex-wrap">
          <select 
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white/10" 
            value={pid ?? ""} 
            onChange={e=>setPid(e.target.value?Number(e.target.value):undefined)}
          >
            <option value="">اختر مريضاً متوقعاً اليوم</option>
            {expectedPatients.map(p=>(
              <option key={p.id} value={p.id}>
                {p.id} — {p.full_name} {p.phone ? `(${p.phone})` : ''}
              </option>
            ))}
          </select>
          
          <input 
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white/10" 
            placeholder="ابحث عن مريض..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
          />
          
          <button 
            className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600"
            onClick={handleAddNewPatient}
          >
            إضافة مريض جديد
          </button>
        </div>
        
        {patients.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-medium mb-1">نتائج البحث:</div>
            <select 
              className="w-full px-3 py-2 rounded-xl bg-white/10"
              value=""
              onChange={e => {
                if (e.target.value) {
                  setPid(Number(e.target.value));
                  e.target.value = "";
                }
              }}
            >
              <option value="">اختر من نتائج البحث</option>
              {patients.map(p=>(
                <option key={p.id} value={p.id}>
                  {p.id} — {p.full_name} {p.phone ? `(${p.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPatient && (
          <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="font-medium">{selectedPatient.full_name}</div>
            <div className="text-sm opacity-70">
              المعرف: {selectedPatient.id} 
              {selectedPatient.phone && ` • الهاتف: ${selectedPatient.phone}`}
            </div>
          </div>
        )}
      </div>

      {/* أزرار الوصول السريع للملفات والتحليلات */}
      {pid && (
        <div className="card rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-4 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 flex items-center gap-2"
              onClick={() => setShowReports(!showReports)}
            >
              <span>📋</span>
              عرض الملفات والتقارير
            </button>
            
            <button 
              className="px-4 py-2 rounded-xl bg-green-600/90 hover:bg-green-600 flex items-center gap-2"
              onClick={handleAddReport}
            >
              <span>📄</span>
              إضافة تقرير جديد
            </button>
            
            <button 
              className="px-4 py-2 rounded-xl bg-orange-600/90 hover:bg-orange-600 flex items-center gap-2"
              onClick={handleViewAnalysis}
            >
              <span>🔬</span>
              التحاليل المهمة
            </button>
          </div>
        </div>
      )}

      {/* عرض الملفات والتقارير */}
      {pid && showReports && (
        <div className="card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">التقارير السابقة</h3>
            <button 
              className="text-sm text-blue-400 hover:text-blue-300"
              onClick={() => setShowReports(false)}
            >
              إغلاق
            </button>
          </div>
          
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-medium">{report.title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    تاريخ: {new Date(report.date).toLocaleDateString('ar-SA')}
                  </div>
                  {report.description && (
                    <div className="text-sm mt-2">{report.description}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm opacity-70 text-center py-4">
                لا توجد تقارير سابقة
              </div>
            )}
          </div>
        </div>
      )}

      {/* عرض التحاليل المهمة */}
      {pid && showNotes && (
        <div className="card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">التحاليل المهمة</h3>
            <button 
              className="text-sm text-blue-400 hover:text-blue-300"
              onClick={() => setShowNotes(false)}
            >
              إغلاق
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔬</div>
            <p>الانتقال إلى صفحة التحاليل</p>
            <button 
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600"
              onClick={handleViewAnalysis}
            >
              عرض التحاليل
            </button>
          </div>
        </div>
      )}

      {/* تحذيرات المرض والملحوظات */}
      {pid && notes.length > 0 && (
        <div className="card rounded-2xl p-4 border border-yellow-500/30 bg-yellow-500/10">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            تحذيرات وملحوظات مهمة
          </h3>
          
          <div className="grid gap-3">
            {notes.slice(0, 3).map((note, index) => (
              <div key={index} className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <div className="flex justify-between items-start">
                  <div className="font-medium">{note.title || 'ملاحظة مهمة'}</div>
                  <div className="text-xs opacity-70">
                    {note.date && new Date(note.date).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="text-sm mt-2">{note.content}</div>
                {note.doctor && (
                  <div className="text-xs opacity-70 mt-2">
                    بواسطة: الدكتور {note.doctor}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {notes.length > 3 && (
            <div className="text-center mt-3">
              <button className="text-sm text-yellow-400 hover:text-yellow-300">
                عرض المزيد ({notes.length - 3})
              </button>
            </div>
          )}
        </div>
      )}

      {/* قائمة الأمراض + نموذج الإضافة/التعديل */}
      {pid && (
        <div className="card rounded-2xl p-4 grid md:grid-cols-[360px_1fr] gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-semibold">إضافة/تعديل مرض</div>
            <select 
              className="px-3 py-2 rounded-xl bg-white/10" 
              value={form.condition_id ?? ""} 
              onChange={e=>setForm(f=>({...f, condition_id: e.target.value?Number(e.target.value):undefined}))}
            >
              <option value="">اختر مرضًا</option>
              {conds.map(c=>(
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input 
              type="date" 
              className="px-3 py-2 rounded-xl bg-white/10" 
              value={form.diagnosed_date ?? ""} 
              onChange={e=>setForm(f=>({...f, diagnosed_date:e.target.value}))}
            />
            <textarea 
              className="px-3 py-2 rounded-xl bg-white/10" 
              placeholder="ملاحظات" 
              value={form.notes ?? ""} 
              onChange={e=>setForm(f=>({...f, notes:e.target.value}))}
            />
            <div className="flex gap-2">
              <button 
                className="px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600" 
                onClick={save} 
                disabled={!pid || !form.condition_id}
              >
                حفظ
              </button>
              {form.pcid && (
                <button 
                  className="px-3 py-2 rounded-xl bg-gray-600/80" 
                  onClick={()=>setForm({})}
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">سجل الأمراض</div>
            <ul className="grid gap-1">
              {rows.map(r=>(
                <li key={r.id} className="rounded-xl px-3 py-2 bg-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs opacity-70">
                      {r.diagnosed_date ? new Date(r.diagnosed_date).toLocaleDateString('ar-SA') : "—"} 
                      {r.notes ? ` • ${r.notes}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-2 py-1 rounded-lg bg-white/10 text-xs" 
                      onClick={()=>setForm({ 
                        pcid:r.id, 
                        condition_id:r.condition_id, 
                        diagnosed_date:r.diagnosed_date ?? undefined, 
                        notes:r.notes ?? undefined 
                      })}
                    >
                      تعديل
                    </button>
                    <button 
                      className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs" 
                      onClick={()=>remove(r.id)}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
              {rows.length===0 && (
                <li className="text-sm opacity-70 text-center py-4">
                  لا توجد أمراض مسجلة
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}