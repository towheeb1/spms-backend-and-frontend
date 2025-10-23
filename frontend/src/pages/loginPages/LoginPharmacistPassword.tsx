import { useEffect, useState } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { pharmacistLoginPassword } from "../../services/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function LoginPharmacistPassword() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;

  useEffect(() => {
    const el = document.getElementById("pharm-login-username");
    el?.focus();
  }, []);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!emailOrUsername || !password) {
      setError("يرجى تعبئة البريد/اسم المستخدم وكلمة المرور");
      return;
    }
    try {
      setLoading(true);
      const res = await pharmacistLoginPassword({ emailOrUsername, password, rememberMe });
      const next = "/dashboard"; // توجيه صريح إلى لوحة الصيدلي
      navigate(next, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "فشل تسجيل الدخول";
      if (/inactive/i.test(msg)) setError("الحساب غير نشط");
      else if (/attempts|locked/i.test(msg)) setError("محاولات كثيرة، تم القفل مؤقتاً");
      else setError("بيانات غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") onSubmit();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="card rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">دخول الصيدلي</h1>
        <p className="text-sm text-gray-400 mb-4">سجّل دخولك بالبريد/اسم المستخدم وكلمة المرور</p>

        {error && (
          <div className="mb-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-2">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="text-xs opacity-80 block mb-1">البريد أو اسم المستخدم</label>
            <Input
              id="pharm-login-username"
              placeholder="example@domain.com أو username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          <div>
            <label className="text-xs opacity-80 block mb-1">كلمة المرور</label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                title={show ? "إخفاء" : "إظهار"}
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              تذكّرني
            </label>
            <Link to="/login/forgot" className="text-sm text-blue-300 hover:text-blue-200">نسيت كلمة المرور؟</Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-400 flex items-center justify-between">
          <span>لا تملك حساباً؟</span>
          <Link to="/register/pharmacist" className="text-blue-300 hover:text-blue-200">إنشاء حساب صيدلي</Link>
        </div>

        <div className="mt-2 text-sm text-gray-400 flex items-center justify-between">
          <span>تريد الدخول عبر الهاتف؟</span>
          <Link to="/login/pharmacist" className="text-blue-300 hover:text-blue-200">تسجيل دخول بالهاتف</Link>
        </div>

       </div>
    </div>
  );
}
 