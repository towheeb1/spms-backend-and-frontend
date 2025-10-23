import { Link } from "react-router-dom"

export function LoginSelect(){
  const cards = [
    { to: "/login/doctor", title: "دخول الطبيب", desc: "كتابة الوصفات والاطلاع على السجل الطبي" },
    { to: "/login/pharmacist", title: "دخول الصيدلي", desc: "نقطة بيع وإدارة الأدوية والمخزون" },
    { to: "/login/patient", title: "دخول المريض", desc: "وصفاتي ومشترياتي وإشعارات الدواء" },
  ]
  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">اختر نوع تسجيل الدخول</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link to={c.to} key={c.to} className="card rounded-2xl p-5 hover:bg-white/10 transition">
              <div className="text-xl font-semibold mb-2">{c.title}</div>
              <p className="opacity-80">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
