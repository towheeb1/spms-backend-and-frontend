import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { toWesternDigits } from "../../utils/digits"
import { api } from "../../services/api"

export function LoginPhone() {
  const nav = useNavigate()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    setError(null)
    const isFourNames = name.trim().split(" ").length >= 4
    const isPhoneValid = phone.trim().length >= 9
    if (!isFourNames || !isPhoneValid) {
      setError("أدخل الاسم الرباعي ورقم هاتف صحيح.")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/otp/send", { name: name.trim(), phone: `+967${phone}` })
    } catch {
      // لو الـAPI غير جاهزة، نكمل الانتقال للتجربة
    } finally {
      setLoading(false)
      nav("/verify", { replace: true, state: { name: name.trim(), phone: `+967${phone}` } })
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-[radial-gradient(ellipse_at_top,rgba(11,92,95,.25),transparent_60%)]">
      <div className="w-full max-w-lg">
        {/* شريط صغير بشعار + دخول سريع */}
        <div className="card rounded-2xl p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SPMS" className="h-8 w-8 rounded-lg" />
            <div className="font-bold text-lg">SPMS — Smart Pharmacy</div>
          </div>
          <Button variant="ghost" onClick={() => nav("/dashboard", { replace: true })}>
            <img src="/logo.svg" alt="" className="h-4 w-4" />
            دخول سريع
          </Button>
        </div>

        <div className="card rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]">
          <h1 className="text-2xl font-extrabold mb-4">تسجيل الدخول</h1>

          {error && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            {/* الاسم */}
            <div className="grid gap-1">
              <label className="text-sm opacity-80">الاسم الرباعي</label>
              <Input
                placeholder="الاسم الرباعي"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* الهاتف (LTR + أرقام فقط) */}
            <div className="grid gap-1">
              <label className="text-sm opacity-80">رقم الهاتف</label>
              <div className="flex gap-2">
                <Input readOnly value="+967" className="w-24 text-center" />
                <Input
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  className="text-left"
                  placeholder="7XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(toWesternDigits(e.target.value))}
                />
              </div>
              <div className="text-xs opacity-60">الكتابة بالأرقام العربية مقبولة وسيتم تحويلها تلقائيًا.</div>
            </div>

            <Button onClick={send} disabled={loading} loading={loading}>
              إرسال رمز الدخول
            </Button>
          </div>
        </div>

        <div className="text-center text-xs opacity-60 mt-3">
          © {new Date().getFullYear()} SPMS — جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  )
}
