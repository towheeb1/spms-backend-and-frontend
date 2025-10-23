export function PatientOrders(){
  const orders = [
    { id:"ORD-311", status:"قيد التجهيز", total: 2450 },
    { id:"ORD-295", status:"تم التسليم", total: 1320 },
  ]
  return (
    <div className="card rounded-2xl p-4">
      <div className="font-semibold mb-2">طلباتي</div>
      <ul className="space-y-2">
        {orders.map(o=>(
          <li key={o.id} className="rounded-xl bg-white/5 p-3 flex items-center justify-between">
            <div>#{o.id} — {o.status}</div>
            <div>{o.total} ر.ي</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
