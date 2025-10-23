import { useEffect, useState } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPharmacistForm() {
  const [fullName, setFullName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [accreditationBody, setAccreditationBody] = useState("");
  const [pharmacyDisplayName, setPharmacyDisplayName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [locale, setLocale] = useState("ar");
  const [branchesCount, setBranchesCount] = useState<number | "">(1);
  const [branches, setBranches] = useState<Array<{ name?: string; address?: string }>>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("reg-pharm-name")?.focus();
    // initialize branches array when branchesCount changes
  }, []);

  function onKeyDown(e: React.KeyboardEvent) { if (e.key === "Enter") onSubmit(); }
  function validPassword(pw: string) { return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw); }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    if (!fullName.trim()) return setError("يرجى إدخال الاسم الكامل");
    if (!emailOrUsername.trim()) return setError("يرجى إدخال البريد أو اسم المستخدم");
    if (phone && !/^\+?\d{7,15}$/.test(phone)) return setError("رقم الهاتف غير صالح");
    if (!validPassword(password)) return setError("كلمة المرور ضعيفة (8+ أحرف مع حرف كبير ورقم)");
    if (password !== confirm) return setError("تأكيد كلمة المرور غير متطابق");

    try {
      setLoading(true);
      const body: any = { full_name: fullName, password };
      if (emailOrUsername.includes("@")) body.email = emailOrUsername; else body.username = emailOrUsername;
      Object.assign(body, {
        phone: phone || undefined,
        title: title || undefined,
        license_no: licenseNo || undefined,
        license_expiry: licenseExpiry || undefined,
        accreditation_body: accreditationBody || undefined,
        pharmacy_display_name: pharmacyDisplayName || undefined,
        address_line1: addr1 || undefined,
        address_line2: addr2 || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        timezone: timezone || undefined,
        locale: locale || undefined,
        branches_count: typeof branchesCount === "number" ? branchesCount : undefined,
        branches: branches.length ? branches : undefined,
      });
      await api.post("/auth/pharmacist/register", body, { withCredentials: true });
      setSuccess("تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
      setTimeout(() => navigate("/login/pharmacist", { replace: true }), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "فشل إنشاء الحساب";
      if (/exists/i.test(msg)) setError("الحساب موجود مسبقاً");
      else if (/weak/i.test(msg)) setError("كلمة المرور ضعيفة");
      else setError("تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  function useGeo() {
    if (!navigator.geolocation) return setError("المتصفح لا يدعم تحديد الموقع");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddr1(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        // يمكن لاحقاً إضافة Reverse Geocoding لملء المدينة/الدولة
      },
      () => setError("تعذر الحصول على الموقع"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="card rounded-2xl p-6 w-full max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <img src="/logo.png" alt="SPMS" className="w-8 h-8" />
        <div>
          <h1 className="text-xl font-bold">تسجيل صيدلي جديد</h1>
          <p className="text-sm text-gray-400">أدخل بياناتك وبيانات منشأتك</p>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-2">{error}</div>}
      {success && <div className="mb-3 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-xl p-2">{success}</div>}

      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Credentials */}
        <section className="grid gap-3">
          <h2 className="font-semibold">بيانات الحساب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">الاسم الرباعي</label>
              <Input id="reg-pharm-name" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">البريد أو اسم المستخدم</label>
              <Input placeholder="example@domain.com أو username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} onKeyDown={onKeyDown} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">رقم الهاتف</label>
              <Input placeholder="مثال: +9677XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">المسمى الوظيفي</label>
              <Input placeholder="صيدلي مرخص" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={useGeo} className="w-full">تحديد العنوان تلقائياً</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">كلمة المرور</label>
              <div className="relative">
                <Input type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown} className="pr-10" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white" title={show ? "إخفاء" : "إظهار"}>{show ? "🙈" : "👁️"}</button>
              </div>
              <div className="text-xs text-gray-500 mt-1">8+ أحرف مع حرف كبير ورقم.</div>
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">تأكيد كلمة المرور</label>
              <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={onKeyDown} />
            </div>
          </div>
        </section>

        {/* License */}
        <section className="grid gap-3">
          <h2 className="font-semibold">الترخيص المهني</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">رقم الترخيص</label>
              <Input placeholder="License Number" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">تاريخ انتهاء الترخيص</label>
              <Input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">جهة الاعتماد</label>
              <Input placeholder="وزارة الصحة..." value={accreditationBody} onChange={(e) => setAccreditationBody(e.target.value)} onKeyDown={onKeyDown} />
            </div>
          </div>
        </section>

        {/* Pharmacy */}
        <section className="grid gap-3">
          <h2 className="font-semibold">بيانات المنشأة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs opacity-80 block mb-1">اسم المنشأة (اختياري)</label>
              <Input placeholder="اسم الصيدلية/المنشأة" value={pharmacyDisplayName} onChange={(e) => setPharmacyDisplayName(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">عدد الفروع</label>
              <Input type="number" min={1} value={branchesCount} onChange={(e) => setBranchesCount(e.target.value ? Number(e.target.value) : "")} />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="grid gap-3">
          <h2 className="font-semibold">العنوان</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">العنوان 1</label>
              <Input value={addr1} onChange={(e) => setAddr1(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">العنوان 2</label>
              <Input value={addr2} onChange={(e) => setAddr2(e.target.value)} onKeyDown={onKeyDown} />
            </div>
          </div>
          {typeof branchesCount === 'number' && branchesCount > 1 && (
            <div className="mt-2 grid gap-2">
              <div className="text-sm opacity-70">تفاصيل الفروع: أدخل اسم وعنوان كل فرع. ستظهر هذه المعلومات لاحقاً في إعدادات الصيدلية وإضافات الأوامر.</div>
              {Array.from({ length: branchesCount }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input placeholder={`اسم الفرع ${i + 1}`} value={branches[i]?.name || ""} onChange={(e) => setBranches(prev => { const copy = [...prev]; copy[i] = { ...(copy[i]||{}), name: e.target.value }; return copy; })} />
                  <Input placeholder={`عنوان الفرع ${i + 1}`} value={branches[i]?.address || ""} onChange={(e) => setBranches(prev => { const copy = [...prev]; copy[i] = { ...(copy[i]||{}), address: e.target.value }; return copy; })} />
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs opacity-80 block mb-1">المدينة</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">المنطقة</label>
              <Input value={state} onChange={(e) => setState(e.target.value)} onKeyDown={onKeyDown} />
            </div>
            <div>
              <label className="text-xs opacity-80 block mb-1">الدولة</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} onKeyDown={onKeyDown} />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs opacity-80 block mb-1">المنطقة الزمنية</label>
            <Input placeholder="مثال: Asia/Riyadh" value={timezone} onChange={(e) => setTimezone(e.target.value)} onKeyDown={onKeyDown} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">اللغة</label>
            <Input placeholder="ar أو en" value={locale} onChange={(e) => setLocale(e.target.value)} onKeyDown={onKeyDown} />
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          <Link to="/login/pharmacist" className="text-sm text-blue-300 hover:text-blue-200">لديك حساب؟ تسجيل الدخول</Link>
          <Button type="submit" disabled={loading}>{loading ? "جاري التسجيل..." : "تسجيل"}</Button>
        </div>
      </form>
    </div>
  );
}
