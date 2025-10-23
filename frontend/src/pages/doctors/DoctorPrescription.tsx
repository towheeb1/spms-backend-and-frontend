import { useState, useEffect } from "react";
import { searchPatients, createPrescription, listConditions } from "../../services/doctorApi";

export default function DoctorPrescription() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<{id:number; full_name:string}[]>([]);
  const [pid, setPid] = useState<number|undefined>();
  const [pname, setPname] = useState("");
  const [conditions, setConditions] = useState<{id:number; name:string}[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<number|undefined>();
  const [selectedMedicines, setSelectedMedicines] = useState<number[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<Record<number, {
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>>({});
  const [notes, setNotes] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [rxId, setRxId] = useState<number|undefined>();
  const [doctorId, setDoctorId] = useState<number|undefined>(1); // قيمة تجريبية

  // بيانات الأدوية المؤقتة
  const [medicines] = useState([
    { id: 1, name: "أموكسيسيلين", category: "مضادات حيوية", condition: "التهابات بكتيرية" },
    { id: 2, name: "باراسيتامول", category: "مسكنات", condition: "ألم وحمى" },
    { id: 3, name: "أيبوبروفين", category: "مسكنات", condition: "التهاب وألم" },
    { id: 4, name: "ديفازين", category: "أنف", condition: "احتقان أنفي" },
    { id: 5, name: "أوفرين", category: "أنف", condition: "تهاب الجيوب الأنفية" },
    { id: 6, name: "كلاريتين", category: "حساسية", condition: "الحساسية" },
    { id: 7, name: "بنادول", category: "مسكنات", condition: "ألم وحمى" },
    { id: 8, name: "ستربتوكازول", category: "مضادات حيوية", condition: "التهابات بكتيرية" },
    { id: 9, name: "نازول", category: "أنف", condition: "احتقان أنفي" },
    { id: 10, name: "زيتروسين", category: "مضادات حيوية", condition: "التهابات بكتيرية" },
    { id: 11, name: "فلوكونازول", category: "مضادات فطرية", condition: "التهابات فطرية" },
    { id: 12, name: "سيتريزين", category: "حساسية", condition: "الحساسية" },
  ]);

  useEffect(() => {
    // تحميل الأمراض للتصنيف
    listConditions().then(setConditions);
  }, []);

  async function find() {
    if (q.trim().length<2) return setPatients([]);
    const list = await searchPatients(q);
    setPatients(list);
  }

  function handleMedicineSelect(medicineId: number, isSelected: boolean) {
    if (isSelected) {
      setSelectedMedicines(prev => [...prev, medicineId]);
      // تهيئة الحقول الفارغة للدواء الجديد
      setPrescriptionItems(prev => ({
        ...prev,
        [medicineId]: { dosage: "", frequency: "", duration: "", instructions: "" }
      }));
    } else {
      setSelectedMedicines(prev => prev.filter(id => id !== medicineId));
      setPrescriptionItems(prev => {
        const newItems = { ...prev };
        delete newItems[medicineId];
        return newItems;
      });
    }
  }

  function updatePrescriptionItem(medicineId: number, field: string, value: string) {
    setPrescriptionItems(prev => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        [field]: value
      }
    }));
  }

  async function submit() {
    if ((!pid && !pname.trim()) || selectedMedicines.length === 0) return;

    const items = selectedMedicines.map(medicineId => {
      const item = prescriptionItems[medicineId] || {};
      return {
        medicine_id: medicineId,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions
      };
    }).filter(item => item.medicine_id);

    const payload = {
      doctor_id: doctorId,
      patient_id: pid,
      patient_name: !pid ? pname.trim() : undefined,
      items,
      notes: notes.trim() || undefined,
      next_visit: nextVisit || undefined
    };

    try {
  const r = await createPrescription(payload as any);
      setRxId(r.prescription_id);
      // إعادة تعيين النموذج بعد الإرسال الناجح
      setSelectedMedicines([]);
      setPrescriptionItems({});
      setNotes("");
      setNextVisit("");
    } catch (error) {
      console.error("Error creating prescription:", error);
    }
  }

  // تصنيف الأدوية حسب الفئة
  const categories = [
    { id: 1, name: "مضادات حيوية" },
    { id: 2, name: "مسكنات" },
    { id: 3, name: "أدوية الأنف" },
    { id: 4, name: "أدوية الحساسية" },
    { id: 5, name: "مضادات فطرية" }
  ];

  const categorizedMedicines = categories.map(category => ({
    category,
    medicines: medicines.filter(med => med.category === category.name)
  }));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">إنشاء وصفة طبية</h1>

      {/* اختيار المريض */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-80 mb-2">اختر مريضًا</div>
            <div className="flex gap-2">
              <input 
                className="flex-1 px-3 py-2 rounded-xl bg-white/10" 
                placeholder="بحث بالاسم أو بالمعرّف" 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
              />
              <button className="px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600" onClick={find}>بحث</button>
            </div>
            <select 
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/10" 
              value={pid ?? ""} 
              onChange={e=>setPid(e.target.value?Number(e.target.value):undefined)}
            >
              <option value="">— اختر من النتائج —</option>
              {patients.map(p=>(
                <option key={p.id} value={p.id}>{p.id} — {p.full_name}</option>
              ))}
            </select>
            {!pid && (
              <input 
                className="mt-2 w-full px-3 py-2 rounded-xl bg-white/10" 
                placeholder="أو اكتب اسم المريض يدويًا" 
                value={pname} 
                onChange={e=>setPname(e.target.value)} 
              />
            )}
          </div>
          <div>
            <div className="text-sm opacity-80 mb-2">ملاحظات مهمة</div>
            <textarea 
              className="w-full px-3 py-2 rounded-xl bg-white/10 h-24" 
              placeholder="ملاحظات مهمة (حساسية، أمراض مزمنة، إلخ)" 
              value={notes}
              onChange={e=>setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* اختيار الأدوية حسب القسم */}
      <div className="card rounded-2xl p-4">
        <div className="text-lg font-semibold mb-4">اختيار الأدوية</div>
        
        {/* مربعات اختيار الأدوية المؤقتة */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3 pb-2 border-b border-white/10">
            الأدوية المتاحة مؤقتاً
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicines.map(medicine => (
              <div key={medicine.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                <input
                  type="checkbox"
                  id={`med-${medicine.id}`}
                  checked={selectedMedicines.includes(medicine.id)}
                  onChange={e => handleMedicineSelect(medicine.id, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor={`med-${medicine.id}`} className="font-medium cursor-pointer">
                    {medicine.name}
                  </label>
                  <div className="text-xs opacity-70 mt-1">{medicine.category}</div>
                  <div className="text-xs text-blue-400 mt-1">{medicine.condition}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل الأدوية المختارة */}
        {selectedMedicines.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-md font-semibold mb-4">تفاصيل الأدوية المختارة</h3>
            <div className="grid gap-4">
              {selectedMedicines.map(medicineId => {
                const medicine = medicines.find(m => m.id === medicineId);
                const item = prescriptionItems[medicineId] || {};
                return (
                  <div key={medicineId} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-blue-400">💊</span>
                      {medicine?.name}
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                        {medicine?.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* الجرعة */}
                      <div>
                        <label className="text-xs opacity-70 block mb-1">الجرعة</label>
                        <select
                          className="w-full px-3 py-2 rounded-xl bg-white/10 text-sm focus:ring-2 focus:ring-blue-500/50"
                          value={item.dosage || ""}
                          onChange={e => updatePrescriptionItem(medicineId, 'dosage', e.target.value)}
                        >
                          <option value="">اختر الجرعة</option>
                          <option value="جرعة واحدة">جرعة واحدة</option>
                          <option value="جرعتين">جرعتين</option>
                          <option value="ثلاث جرعات">ثلاث جرعات</option>
                          <option value="نصف جرعة">نصف جرعة</option>
                          <option value="ربع جرعة">ربع جرعة</option>
                          <option value="جرعة كاملة">جرعة كاملة</option>
                        </select>
                      </div>

                      {/* التكرار */}
                      <div>
                        <label className="text-xs opacity-70 block mb-1">التكرار</label>
                        <select
                          className="w-full px-3 py-2 rounded-xl bg-white/10 text-sm focus:ring-2 focus:ring-blue-500/50"
                          value={item.frequency || ""}
                          onChange={e => updatePrescriptionItem(medicineId, 'frequency', e.target.value)}
                        >
                          <option value="">اختر التكرار</option>
                          <option value="مرة واحدة يومياً">مرة واحدة يومياً</option>
                          <option value="مرتين يومياً">مرتين يومياً</option>
                          <option value="ثلاث مرات يومياً">ثلاث مرات يومياً</option>
                          <option value="أربع مرات يومياً">أربع مرات يومياً</option>
                          <option value="قبل النوم">قبل النوم</option>
                          <option value="قبل الإفطار">قبل الإفطار</option>
                          <option value="بعد الإفطار">بعد الإفطار</option>
                          <option value="قبل الغداء">قبل الغداء</option>
                          <option value="بعد الغداء">بعد الغداء</option>
                          <option value="قبل العشاء">قبل العشاء</option>
                          <option value="بعد العشاء">بعد العشاء</option>
                        </select>
                      </div>

                      {/* المدة */}
                      <div>
                        <label className="text-xs opacity-70 block mb-1">المدة</label>
                        <input
                          type="text"
                          placeholder="مثال: 7 أيام"
                          className="w-full px-3 py-2 rounded-xl bg-white/10 text-sm focus:ring-2 focus:ring-blue-500/50"
                          value={item.duration || ""}
                          onChange={e => updatePrescriptionItem(medicineId, 'duration', e.target.value)}
                        />
                      </div>

                      {/* تعليمات إضافية */}
                      <div>
                        <label className="text-xs opacity-70 block mb-1">تعليمات إضافية</label>
                        <input
                          type="text"
                          placeholder="تعليمات خاصة"
                          className="w-full px-3 py-2 rounded-xl bg-white/10 text-sm focus:ring-2 focus:ring-blue-500/50"
                          value={item.instructions || ""}
                          onChange={e => updatePrescriptionItem(medicineId, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* موعد الزيارة القادم */}
      <div className="card rounded-2xl p-4">
        <div className="text-lg font-semibold mb-3">معلومات إضافية</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-80 block mb-2">موعد الزيارة القادم</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50"
              value={nextVisit}
              onChange={e=>setNextVisit(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm opacity-80 block mb-2">معرّف الطبيب</label>
            <input 
              className="w-full px-3 py-2 rounded-xl bg-white/10 focus:ring-2 focus:ring-blue-500/50" 
              placeholder="doctor_id" 
              value={doctorId ?? ""} 
              onChange={e=>setDoctorId(e.target.value?Number(e.target.value):undefined)} 
            />
          </div>
        </div>
      </div>

      {/* زر الإرسال */}
      <div className="card rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            className="px-6 py-3 rounded-xl bg-green-600/90 hover:bg-green-600 font-medium disabled:opacity-50 transition-colors flex items-center gap-2" 
            onClick={submit} 
            disabled={(!pid && !pname.trim()) || selectedMedicines.length === 0}
          >
            <span>📋</span>
            إنشاء الوصفة وإرسالها
          </button>
          
          {rxId && (
            <div className="text-green-400 font-medium flex items-center gap-2">
              <span>✓</span>
              تم إنشاء الوصفة بنجاح برقم: {rxId}
            </div>
          )}
          
          {selectedMedicines.length === 0 && (
            <div className="text-yellow-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              يجب اختيار دواء واحد على الأقل
            </div>
          )}
        </div>
      </div>
    </div>
  );
}