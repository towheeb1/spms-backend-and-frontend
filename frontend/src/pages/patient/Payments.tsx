import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"

export function PatientPayments(){
  return (
    <div className="grid gap-4">
      <div className="card rounded-2xl p-4">
        <div className="font-semibold mb-2">دفع فاتورة</div>
        <div className="grid sm:grid-cols-3 gap-2">
          <Input placeholder="رقم الفاتورة" />
          <Input placeholder="المبلغ" type="number" />
          <Button>دفع</Button>
        </div>
        <p className="opacity-70 text-sm mt-2">* للتكامل لاحقًا مع بوابة الدفع.</p>
      </div>
    </div>
  )
}
