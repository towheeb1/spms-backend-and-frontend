import dayjs from "dayjs"
import type { SearchResult, SearchFilters, SearchType } from "../../store/search"

// نماذج محلية (Fallback) — استبدلها لاحقاً باستدعاءات API حقيقية
const rx = [
  { id:"RX-1204", title:"التهاب لوز — مضاد حيوي + خافض", doctor:"د. أحمد القحطاني", diagnosis:"Tonsillitis", date:"2025-08-20", status:"سارية" },
  { id:"RX-1189", title:"ارتجاع معدي — Omeprazole", doctor:"د. منى الشامي", diagnosis:"GERD", date:"2025-07-14", status:"مغلقة" },
  { id:"RX-1172", title:"تحسس موسمي — Cetirizine + Fluticasone", doctor:"د. ناصر العمري", diagnosis:"Allergic Rhinitis", date:"2025-05-10", status:"منتهية" },
]

const orders = [
  { id:"ORD-311", status:"قيد التجهيز", total:2450, date:"2025-08-22" },
  { id:"ORD-295", status:"تم التسليم", total:1320, date:"2025-08-10" },
]

const invoices = [
  { no:"INV-901", date:"2025-08-22", amount:980, paid:true },
  { no:"INV-873", date:"2025-08-10", amount:450, paid:false },
]

const payments = [
  { id:"PAY-771", date:"2025-08-22", amount:980, method:"بطاقة" },
  { id:"PAY-733", date:"2025-08-10", amount:450, method:"نقدي" },
]

const profile = { name:"المريض التجريبي", nationalId:"1234567890", phone:"+9677XXXXXXX" }
const addresses = [
  { id:"ADDR-1", city:"صنعاء", area:"حدة", note:"بجوار ..." }
]
const insurance = { company:"Yemen Insure", cardNo:"INS-55421", expires:"2026-01-31" }
const pharmacies = [
  { id:"PH-10", name:"صيدلية الهناء", distanceKm:1.2 },
  { id:"PH-02", name:"صيدلية الشفاء", distanceKm:2.0 }
]
const settings = [
  { key:"language", value:"ar" },
  { key:"theme", value:"system" },
  { key:"notifyDose", value:true },
]

function inDateRange(date: string, f: SearchFilters) {
  const d = dayjs(date)
  if (f.dateFrom && d.isBefore(dayjs(f.dateFrom))) return false
  if (f.dateTo && d.isAfter(dayjs(f.dateTo))) return false
  return true
}

export async function runAccountSearch(query: string, f: SearchFilters): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase()
  const allow = (t: SearchType) => f.types.has(t)

  const out: SearchResult[] = []

  if (allow("prescriptions")) {
    rx.forEach(r => {
      const hay = `${r.id} ${r.title} ${r.doctor} ${r.diagnosis}`.toLowerCase()
      if ((q === "" || hay.includes(q)) && inDateRange(r.date, f) && (!f.status || f.status.length===0 || f.status.includes(r.status))) {
        out.push({
          id: r.id,
          type: "prescriptions",
          title: r.title,
          subtitle: `${r.doctor} — ${r.diagnosis} — ${r.date} — ${r.status}`,
          route: `/patient/prescriptions?open=${r.id}`
        })
      }
    })
  }

  if (allow("orders")) {
    orders.forEach(o => {
      const hay = `${o.id} ${o.status}`.toLowerCase()
      if ((q === "" || hay.includes(q)) && inDateRange(o.date, f) && (!f.status || f.status.length===0 || f.status.includes(o.status))) {
        out.push({
          id: o.id, type:"orders",
          title: `طلب ${o.id}`,
          subtitle: `${o.status} — ${o.total} ر.ي — ${o.date}`,
          route: "/patient/orders"
        })
      }
    })
  }

  if (allow("invoices")) {
    invoices.forEach(v => {
      const hay = `${v.no} ${v.amount} ${v.paid?"paid":"unpaid"}`.toLowerCase()
      if ((q === "" || hay.includes(q)) && inDateRange(v.date, f)) {
        if (typeof f.minAmount === "number" && v.amount < f.minAmount) return
        if (typeof f.maxAmount === "number" && v.amount > f.maxAmount) return
        out.push({
          id: v.no, type:"invoices",
          title: `فاتورة ${v.no}`,
          subtitle: `${v.date} — ${v.amount} ر.ي — ${v.paid? "مدفوعة":"غير مدفوعة"}`,
          route: "/patient/invoices"
        })
      }
    })
  }

  if (allow("payments")) {
    payments.forEach(p => {
      const hay = `${p.id} ${p.method} ${p.amount}`.toLowerCase()
      if ((q === "" || hay.includes(q)) && inDateRange(p.date, f)) {
        if (typeof f.minAmount === "number" && p.amount < f.minAmount) return
        if (typeof f.maxAmount === "number" && p.amount > f.maxAmount) return
        out.push({
          id: p.id, type:"payments",
          title: `دفعة ${p.id}`,
          subtitle: `${p.date} — ${p.amount} — ${p.method}`,
          route: "/patient/payments"
        })
      }
    })
  }

  if (allow("profile")) {
    const hay = `${profile.name} ${profile.nationalId} ${profile.phone}`.toLowerCase()
    if (q === "" || hay.includes(q)) {
      out.push({ id:"profile", type:"profile", title:"بياناتي", subtitle:`${profile.name} — ${profile.phone}`, route:"/patient/profile" })
    }
  }

  if (allow("addresses")) {
    addresses.forEach(a=>{
      const hay = `${a.city} ${a.area} ${a.note}`.toLowerCase()
      if (q === "" || hay.includes(q)) {
        out.push({ id:a.id, type:"addresses", title:`${a.city} — ${a.area}`, subtitle:a.note, route:"/patient/addresses" })
      }
    })
  }

  if (allow("insurance")) {
    const hay = `${insurance.company} ${insurance.cardNo}`.toLowerCase()
    if (q === "" || hay.includes(q)) {
      out.push({ id:"insurance", type:"insurance", title:"بطاقة التأمين", subtitle:`${insurance.company} — ${insurance.cardNo}`, route:"/patient/insurance" })
    }
  }

  if (allow("pharmacies")) {
    pharmacies.forEach(p=>{
      const hay = `${p.name} ${p.distanceKm}`.toLowerCase()
      if (q === "" || hay.includes(q)) {
        out.push({ id:p.id, type:"pharmacies", title:p.name, subtitle:`${p.distanceKm} كم`, route:"/patient/pharmacies" })
      }
    })
  }

  if (allow("settings")) {
    settings.forEach(s=>{
      const hay = `${s.key} ${s.value}`.toLowerCase()
      if (q === "" || hay.includes(q)) {
        out.push({ id:s.key, type:"settings", title:`إعداد: ${s.key}`, subtitle:String(s.value), route:"/patient/settings" })
      }
    })
  }

  // ترتيب بسيط: الأحدث تاريخاً أولاً إن أمكن
  return out.sort((a,b)=> (b.subtitle||"").localeCompare(a.subtitle||""))
}
