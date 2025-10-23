import { useEffect, useState } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { pharmacistLoginPassword } from "../../services/auth";
import { ButtonLoader } from "../../components/ui/Loader";
import { useToast } from "../../components/ui/Toast";

// ---- Lightweight layout wrappers (match your UI style) ----
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <h4 className="mb-3 text-sm font-semibold opacity-80">{title}</h4>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="opacity-80">{label}</span>
      {children}
      {hint ? <span className="text-xs opacity-60">{hint}</span> : null}
    </label>
  );
}

export default function RegisterPharmacist() {
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
  const [branchesCount, setBranchesCount] = useState<string>("1");
  const [branches, setBranches] = useState<Array<{ name?: string; address?: string }>>([]);
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [locale, setLocale] = useState("ar");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    document.getElementById("reg-pharm-name")?.focus();
  }, []);

  function validPassword(pw: string) {
    return pw.length >= 8  && /[0-9]/.test(pw);
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!fullName.trim()) return toast.error("يرجى إدخال الاسم الكامل");
    if (!emailOrUsername.trim()) return toast.error("يرجى إدخال البريد أو اسم المستخدم");
    if (phone && /^\+?\d{7,15}$/.test(phone) === false) return toast.error("رقم الهاتف غير صالح");
    if (!validPassword(password)) return toast.error("كلمة المرور ضعيفة ");
    if (password !== confirm) return toast.error("تأكيد كلمة المرور غير متطابق");

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
        branches_count: Number.isFinite(Number(branchesCount)) && Number(branchesCount) > 0 ? Number(branchesCount) : undefined,
        branches: branches.length ? branches : undefined,
        address_line1: addr1 || undefined,
        address_line2: addr2 || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        timezone: timezone || undefined,
        locale: locale || undefined,
      });
      await api.post("/auth/pharmacist/register", body, { withCredentials: true });
      toast.success("تم إنشاء الحساب بنجاح!");
      try {
        await pharmacistLoginPassword({ emailOrUsername, password, rememberMe: true });
        toast.success("مرحباً بك!");
        navigate("/dashboard", { replace: true });
        return;
      } catch {
        toast.info("يمكنك تسجيل الدخول الآن");
        setTimeout(() => navigate("/login/pharmacist", { replace: true }), 1500);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "فشل إنشاء الحساب";
      if (/exists/i.test(msg)) toast.error("الحساب موجود مسبقاً");
      else if (/weak/i.test(msg)) toast.error("كلمة المرور ضعيفة");
      else toast.error("تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) { if (e.key === "Enter") onSubmit(); }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="card rounded-2xl p-6 w-full max-w-2xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">تسجيل صيدلي جديد</h1>
          <p className="text-sm text-gray-400">أنشئ حسابك باستخدام البريد/اسم المستخدم وكلمة المرور</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          {/* 1) معلومات الحساب */}
          <Section title="معلومات الحساب">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="الاسم الرباعي">
                <Input id="reg-pharm-name" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
              <Field label="البريد أو اسم المستخدم">
                <Input placeholder="example@domain.com أو username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
             <Field label="رقم الهاتف">
  <Input
    type="tel"
    inputMode="tel"
    dir="ltr"
    placeholder="+9677XXXXXXX"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    onKeyDown={onKeyDown}
    className="h-10 text-sm placeholder-white/40"
  />
</Field>
              <div className="grid grid-cols-1 gap-3">
                <Field label="كلمة المرور" hint="8+ أحرف مع حرف كبير ورقم.">
                  <div className="relative">
                    <Input type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown} className="pr-10" />
                    <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white" title={show ? "إخفاء" : "إظهار"}>{show ? "🙈" : "👁️"}</button>
                  </div>
                </Field>
                <Field label="تأكيد كلمة المرور">
                  <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={onKeyDown} />
                </Field>
              </div>
            </div>
          </Section>

          {/* 2) بيانات مهنية */}
          <Section title="البيانات المهنية">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="المسمى الوظيفي">
                <Input placeholder="صيدلي مرخص" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
              <Field label="جهة الاعتماد">
                <Input placeholder="وزارة الصحة..." value={accreditationBody} onChange={(e) => setAccreditationBody(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
              <Field label="رقم الترخيص">
                <Input placeholder="License Number" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
              <Field label="تاريخ انتهاء الترخيص">
                <Input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
            </div>
          </Section>

          {/* 3) معلومات المنشأة و الفروع */}
          <Section title="منشأتك والفروع">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="اسم المنشأة (اختياري)">
                <Input placeholder="اسم الصيدلية/المنشأة" value={pharmacyDisplayName} onChange={(e) => setPharmacyDisplayName(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
              <Field label="عدد الفروع">
                <Input type="number" min={1} placeholder="1" value={branchesCount} onChange={(e) => setBranchesCount(e.target.value)} onKeyDown={onKeyDown} />
              </Field>
            </div>

            {Number(branchesCount) > 1 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 text-sm opacity-80">تفاصيل الفروع (أضف أسماء وعناوين الفروع). سيتم حفظها في ملف الصيدلية.</div>
                <div className="grid gap-2">
                  {Array.from({ length: Number(branchesCount) }).map((_, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Input placeholder={`اسم الفرع ${i + 1}`} value={branches[i]?.name || ""} onChange={(e) => setBranches((prev) => { const copy = [...prev]; copy[i] = { ...(copy[i] || {}), name: e.target.value }; return copy; })} />
                      <Input placeholder={`عنوان الفرع ${i + 1}`} value={branches[i]?.address || ""} onChange={(e) => setBranches((prev) => { const copy = [...prev]; copy[i] = { ...(copy[i] || {}), address: e.target.value }; return copy; })} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* 4) العنوان */}
          <Section title="العنوان">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="العنوان 1"><Input value={addr1} onChange={(e) => setAddr1(e.target.value)} onKeyDown={onKeyDown} /></Field>
              <Field label="العنوان 2"><Input value={addr2} onChange={(e) => setAddr2(e.target.value)} onKeyDown={onKeyDown} /></Field>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="المدينة"><Input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={onKeyDown} /></Field>
              <Field label="المنطقة"><Input value={state} onChange={(e) => setState(e.target.value)} onKeyDown={onKeyDown} /></Field>
              <Field label="الدولة"><Input value={country} onChange={(e) => setCountry(e.target.value)} onKeyDown={onKeyDown} /></Field>
            </div>
          </Section>

          {/* 5) التفضيلات */}
          <Section title="التفضيلات">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="المنطقة الزمنية"><Input placeholder="مثال: Asia/Riyadh" value={timezone} onChange={(e) => setTimezone(e.target.value)} onKeyDown={onKeyDown} /></Field>
              <Field label="اللغة"><Input placeholder="ar أو en" value={locale} onChange={(e) => setLocale(e.target.value)} onKeyDown={onKeyDown} /></Field>
            </div>
          </Section>

          {/* Submit */}
          <div className="sticky bottom-0 z-10 bg-gradient-to-t from-black/30 to-transparent pt-1">
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              {loading ? (<><ButtonLoader /> جاري التسجيل...</>) : ("تسجيل")}
            </Button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>لديك حساب؟</span>
          <Link to="/login/pharmacist" className="text-blue-300 hover:text-blue-200">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
