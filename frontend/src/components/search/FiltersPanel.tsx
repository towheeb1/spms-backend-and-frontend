import { useState } from "react"
import { useSearch, SearchType } from "../../store/search"
import { Modal } from "../ui/Modal"

export function FiltersPanel({ onClose }:{ onClose:()=>void }) {
  const { filters, setFilters } = useSearch()
  const [local, setLocal] = useState({
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    status: (filters.status || []).join(","),
    minAmount: filters.minAmount ?? "",
    maxAmount: filters.maxAmount ?? "",
    types: new Set(filters.types),
  })

  const toggleType = (t: SearchType) => {
    const s = new Set(local.types)
    s.has(t) ? s.delete(t) : s.add(t)
    setLocal({ ...local, types: s })
  }

  const apply = () => {
    setFilters({
      dateFrom: local.dateFrom || undefined,
      dateTo: local.dateTo || undefined,
      status: local.status ? local.status.split(",").map(s=>s.trim()).filter(Boolean) : [],
      minAmount: local.minAmount === "" ? undefined : Number(local.minAmount),
      maxAmount: local.maxAmount === "" ? undefined : Number(local.maxAmount),
      types: local.types
    })
    onClose()
  }

  const clear = () => {
    setLocal({
      dateFrom: "",
      dateTo: "",
      status: "",
      minAmount: "",
      maxAmount: "",
      types: new Set<SearchType>(["prescriptions","orders","invoices","payments","profile","addresses","insurance","pharmacies","settings"])
    })
  }

  const TypeChip = ({ t, label }:{ t: SearchType, label: string }) => (
    <button
      onClick={()=>toggleType(t)}
      className={`px-3 py-1 rounded-xl border ${local.types.has(t) ? "bg-brand/20 border-brand" : "bg-white/5 border-white/20"}`}
    >{label}</button>
  )

  return (
    <Modal open={true} onClose={onClose} title="فلاتر البحث" footer={
      <div className="flex gap-2">
        <button onClick={apply} className="px-4 py-2 rounded-2xl bg-brand hover:bg-brand/90">تطبيق</button>
        <button onClick={clear} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20">إعادة تعيين</button>
      </div>
    }>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="font-semibold">النطاق الزمني</div>
          <div className="grid md:grid-cols-2 gap-2">
            <input type="date" className="px-3 py-2 rounded-2xl bg-white/10" value={local.dateFrom} onChange={e=>setLocal({...local, dateFrom:e.target.value})} />
            <input type="date" className="px-3 py-2 rounded-2xl bg-white/10" value={local.dateTo} onChange={e=>setLocal({...local, dateTo:e.target.value})} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="font-semibold">الحالة (افصلها بفواصل)</div>
          <input className="px-3 py-2 rounded-2xl bg-white/10" placeholder="سارية, منتهية, مغلقة, تم التسليم, قيد التجهيز ..." value={local.status} onChange={e=>setLocal({...local, status:e.target.value})}/>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          <div>
            <div className="font-semibold mb-1">المبلغ الأدنى</div>
            <input className="px-3 py-2 rounded-2xl bg-white/10 w-full" inputMode="numeric" value={local.minAmount} onChange={e=>setLocal({...local, minAmount:e.target.value})}/>
          </div>
          <div>
            <div className="font-semibold mb-1">المبلغ الأقصى</div>
            <input className="px-3 py-2 rounded-2xl bg-white/10 w-full" inputMode="numeric" value={local.maxAmount} onChange={e=>setLocal({...local, maxAmount:e.target.value})}/>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="font-semibold">نطاقات البحث</div>
          <div className="flex flex-wrap gap-2">
            <TypeChip t="prescriptions" label="الوصفات" />
            <TypeChip t="orders" label="الطلبات" />
            <TypeChip t="invoices" label="الفواتير" />
            <TypeChip t="payments" label="المدفوعات" />
            <TypeChip t="profile" label="الملف" />
            <TypeChip t="addresses" label="العناوين" />
            <TypeChip t="insurance" label="التأمين" />
            <TypeChip t="pharmacies" label="الصيدليات" />
            <TypeChip t="settings" label="الإعدادات" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
