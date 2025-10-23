import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"

export function PatientInsurance(){
  return (
    <div className="card rounded-2xl p-4 grid gap-3">
      <div className="font-semibold">بطاقة التأمين</div>
      <div className="grid md:grid-cols-3 gap-2">
        <Input placeholder="الشركة" />
        <Input placeholder="رقم البطاقة" />
        <Input placeholder="تاريخ الانتهاء" />
      </div>
      <Button>حفظ</Button>
    </div>
  )
}
    