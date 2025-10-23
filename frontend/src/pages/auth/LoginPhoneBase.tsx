import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { toWesternDigits } from "../../utils/digits"
import { useAuth } from "../../store/auth"
import { api } from "../../services/api"
import { AuthLayout } from "../../components/ui/AuthLayout"

type Props = { role: "Doctor" | "Pharmacist" | "Patient"; title: string }

export function LoginPhoneBase({ role, title }: Props) {
  const nav = useNavigate()
  const { setUser } = useAuth()

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
      if (role === "Pharmacist") {
        const { data } = await api.post("/auth/pharmacist/login", { full_name: name.trim(), phone: `+967${phone}` })
        // persist simple session
        localStorage.setItem("spms_user", JSON.stringify({ id: String(data?.pharmacist?.id || Date.now()), name: data?.pharmacist?.full_name || name.trim(), phone: `+967${phone}`, role: "Pharmacist" }))
        setUser({ id: String(data?.pharmacist?.id || Date.now()), name: data?.pharmacist?.full_name || name.trim(), phone: `+967${phone}`, role: "Pharmacist" as any })
        nav("/dashboard", { replace: true })
        return
      }
      await api.post("/auth/otp/send", { name: name.trim(), phone: `+967${phone}` })
    } catch { /* السماح بالانتقال عند غياب الباك */ }
    finally {
      setLoading(false)
      if (role !== "Pharmacist") {
        nav("/verify", { replace: true, state: { name: name.trim(), phone: `+967${phone}`, role } })
      }
    }
  }

  return (
    <AuthLayout title={title} onQuickEnter={() => {
      const dest = role === "Doctor" ? "/doctor" : role === "Patient" ? "/patient" : "/dashboard"
      setUser({ id: "guest", name: "Guest", phone: "", role: role as any })
      nav(dest, { replace: true })
    }}>
      <Card className="shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]">
        <h1 className="text-2xl font-extrabold mb-4">تسجيل الدخول — {title}</h1>

        {error && (
          <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm opacity-80">الاسم الرباعي</label>
            <Input placeholder="الاسم الرباعي" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">رقم الهاتف</label>
            <div className="flex gap-2">
              <Input readOnly value="+967" className="w-24 text-center" />
              <Input
                type="tel" inputMode="numeric" dir="ltr" className="text-left"
                placeholder="7XXXXXXXX" value={phone}
                onChange={(e)=>setPhone(toWesternDigits(e.target.value))}
              />
            </div>
            <div className="text-xs opacity-60">الأرقام العربية تُحوّل تلقائياً.</div>
          </div>

          <Button onClick={send} disabled={loading} loading={loading}>
            إرسال رمز الدخول
          </Button>
        </div>
      </Card>
    </AuthLayout>
  )
}
