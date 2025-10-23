import { useEffect, useState } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Switch } from "../../components/ui/Switch"
import { applyUiSettings, loadSettings, saveSettings, SETTINGS_KEY } from "../../utils/ui"

type Theme = "system" | "dark" | "light"
type Lang = "ar" | "en"
type TimeFmt = "24h" | "12h"

type Settings = {
  language: Lang
  theme: Theme
  rtl: boolean
  timeFormat: TimeFmt
  currency: "YER" | "SAR" | "USD"

  notifyDose: boolean
  notifyRefill: boolean
  notifyOrder: boolean

  locationEnabled: boolean
  offlineMode: boolean
  textScale: number // 100..140
}

const DEFAULTS: Settings = {
  language: "ar",
  theme: "system",
  rtl: true,
  timeFormat: "24h",
  currency: "YER",
  notifyDose: true,
  notifyRefill: true,
  notifyOrder: true,
  locationEnabled: false,
  offlineMode: true,
  textScale: 100,
}

export function PatientSettings() {
  const [s, setS] = useState<Settings>(DEFAULTS)
  const [saving, setSaving] = useState(false)

  // حمل من التخزين وطبّق فور فتح الصفحة
  useEffect(() => {
    const loaded = loadSettings<Settings>(DEFAULTS)
    setS(loaded)
    applyUiSettings({
      rtl: loaded.rtl,
      theme: loaded.theme,
      language: loaded.language,
      textScale: loaded.textScale,
    })
  }, [])

  // حفظ وتطبيق تلقائي على كل تغيير (Auto-save)
  useEffect(() => {
    saveSettings(s)
    applyUiSettings({
      rtl: s.rtl,
      theme: s.theme,
      language: s.language,
      textScale: s.textScale,
    })
    setSaving(true)
    const t = setTimeout(() => setSaving(false), 250)
    return () => clearTimeout(t)
  }, [s])

  // أدوات
  async function testNotification() {
    if (!("Notification" in window)) { alert("المتصفح لا يدعم الإشعارات"); return }
    const perm = await Notification.requestPermission()
    if (perm === "granted") new Notification("SPMS", { body: "تذكير تجريبي بالجرعة: Paracetamol 500mg الآن." })
    else alert("تم رفض الإذن بالإشعارات")
  }
  function requestLocation() {
    if (!navigator.geolocation) { alert("المتصفح لا يدعم الموقع"); return }
    navigator.geolocation.getCurrentPosition(
      () => setS(v => ({ ...v, locationEnabled: true })),
      () => alert("تعذّر الحصول على الموقع")
    )
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ settings: s }, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `spms-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function requestAccountDeletion() {
    if (confirm("سيتم إرسال طلب حذف الحساب للمراجعة. متابعة؟")) {
      alert("تم تسجيل طلب حذف الحساب. سنعاود التواصل خلال 48 ساعة.")
    }
  }
  function resetAll() {
    if (!confirm("إعادة ضبط جميع الإعدادات؟")) return
    setS(DEFAULTS) // سيُحفظ ويُطبّق تلقائيًا عبر الـuseEffect أعلاه
  }

  return (
    <div className="grid gap-4">
      <div className="card rounded-2xl p-4 flex items-center justify-between">
          
       
         
      </div>

      {/* اللغة والمظهر وRTL */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="font-semibold">اللغة والمظهر</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm opacity-80 mb-1">اللغة</div>
            <select className="px-3 py-2 rounded-2xl bg-white/10 w-full"
              value={s.language} onChange={(e)=>setS(v=>({...v, language: e.target.value as Lang}))}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <div className="text-sm opacity-80 mb-1">المظهر</div>
            <select className="px-3 py-2 rounded-2xl bg-white/10 w-full"
              value={s.theme} onChange={(e)=>setS(v=>({...v, theme: e.target.value as Theme}))}>
              <option value="system">حسب النظام</option>
              <option value="dark">داكن</option>
              <option value="light">فاتح</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Switch checked={s.rtl} onChange={(v)=>setS(x=>({...x, rtl: v}))} label={`اتجاه ${s.rtl ? "RTL" : "LTR"}`} />
            <div className="text-sm opacity-80">يطبَّق على جميع الصفحات فورًا.</div>
          </div>
        </div>
      </div>

      {/* التنسيقات */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="font-semibold">التنسيقات</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm opacity-80 mb-1">تنسيق الوقت</div>
            <select className="px-3 py-2 rounded-2xl bg-white/10 w-full"
              value={s.timeFormat} onChange={(e)=>setS(v=>({...v, timeFormat: e.target.value as TimeFmt}))}>
              <option value="24h">24 ساعة</option>
              <option value="12h">12 ساعة</option>
            </select>
          </div>

          <div>
            <div className="text-sm opacity-80 mb-1">العملة</div>
            <select className="px-3 py-2 rounded-2xl bg-blue/10 w-full"
              value={s.currency} onChange={(e)=>setS(v=>({...v, currency: e.target.value as Settings["currency"]}))}>
              <option value="YER">ريال يمني (YER)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار (USD)</option>
            </select>
          </div>

          <div>
            <div className="text-sm opacity-80 mb-1">حجم النص (%)</div>
            <div className="flex items-center gap-2">
              <input type="range" min={90} max={140} step={5}
                value={s.textScale} onChange={(e)=>setS(v=>({...v, textScale: Number(e.target.value)}))}
                className="w-full" />
              <Input readOnly value={`${s.textScale}%`} className="w-24 text-center" />
            </div>
          </div>
        </div>
      </div>

      {/* الإشعارات */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="font-semibold">الإشعارات</div>
        <div className="grid md:grid-cols-3 gap-2">
          <Switch checked={s.notifyDose} onChange={(v)=>setS(x=>({...x, notifyDose:v}))} label="تذكير الجرعات" />
          <Switch checked={s.notifyRefill} onChange={(v)=>setS(x=>({...x, notifyRefill:v}))} label="تجديد الوصفات" />
          <Switch checked={s.notifyOrder} onChange={(v)=>setS(x=>({...x, notifyOrder:v}))} label="تحديثات الطلبات" />
        </div>
        <div>
          {/* زر بإحساس LTR عند الضغط */}
          <Button dir="ltr" onClick={testNotification}>إشعار تجريبي</Button>
        </div>
      </div>

      {/* الموقع والأوفلاين */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="font-semibold">الموقع والأوفلاين</div>
        <div className="grid md:grid-cols-3 gap-2">
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div>السماح بالموقع</div>
            <Switch checked={s.locationEnabled} onChange={(v)=>{ setS(x=>({...x, locationEnabled:v})); if(v) requestLocation(); }} />
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div>تفعيل وضع الأوفلاين</div>
            <Switch checked={s.offlineMode} onChange={(v)=>setS(x=>({...x, offlineMode:v}))} />
          </div>
        </div>
      </div>

      {/* الخصوصية والحساب */}
      <div className="card rounded-2xl p-4 grid gap-3">
        <div className="font-semibold">الخصوصية والحساب</div>
        <div className="grid md:grid-cols-3 gap-2">
          <Button dir="ltr" onClick={exportData}>تصدير بياناتي (JSON)</Button>
          <Button dir="ltr" variant="danger" onClick={requestAccountDeletion}>طلب حذف الحساب</Button>
          <Button dir="ltr" variant="ghost" onClick={resetAll}>إعادة ضبط جميع الإعدادات</Button>
        </div>
      </div>

      {/* حفظ مرئي (صار تلقائي) */}
      <div className="sticky bottom-2 z-10 self-end justify-self-end">
        <Button dir="ltr" elevated disabled>
          {saving ? "جارٍ الحفظ..." : "تم الحفظ تلقائيًا"}
        </Button>
      </div>
    </div>
  )
}
