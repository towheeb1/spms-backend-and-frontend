import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"

export function PatientAddresses(){
  return (
    <div className="grid gap-4">
      <div className="card rounded-2xl p-4 grid gap-2">
        <div className="font-semibold">عنوان جديد</div>
        <div className="grid md:grid-cols-3 gap-2">
          <Input placeholder="المدينة" />
          <Input placeholder="الحي" />
          <Input placeholder="وصف مختصر" />
        </div>
        <Button>إضافة</Button>
      </div>
      <div className="card rounded-2xl p-4">
        <div className="font-semibold mb-2">عناويني</div>
        <ul className="space-y-2">
          <li className="bg-white/5 rounded-xl p-3">صنعاء — حدة — بجوار …</li>
        </ul>
      </div>
    </div>
  )
}
