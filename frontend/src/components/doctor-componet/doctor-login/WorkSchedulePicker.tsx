// src/components/doctor-login/WorkSchedulePicker.tsx
import { Input } from "../../ui/Input";
import { DAY_LABEL, DoctorProfilePayload, WorkDay } from "./types";

type Props = { value: DoctorProfilePayload; onChange: (v: DoctorProfilePayload) => void };

export default function WorkSchedulePicker({ value, onChange }: Props) {
  const toggleDay = (d: WorkDay) => {
    const set = new Set(value.work_schedule.days);
    set.has(d) ? set.delete(d) : set.add(d);
    onChange({ ...value, work_schedule: { ...value.work_schedule, days: Array.from(set) as WorkDay[] } });
  };

  return (
    <section className="card rounded-2xl p-4 bg-white/5 grid gap-3">
      <div className="text-sm font-semibold">أوقات الدوام</div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(DAY_LABEL) as WorkDay[]).map((d) => (
          <label
            key={d}
            className={`px-3 py-1 rounded-xl border border-white/10 cursor-pointer ${value.work_schedule.days.includes(d) ? "bg-blue-600" : "hover:bg-white/10"}`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={value.work_schedule.days.includes(d)}
              onChange={() => toggleDay(d)}
            />
            {DAY_LABEL[d]}
          </label>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm opacity-80">من</label>
          <Input
            type="time"
            value={value.work_schedule.start}
            onChange={(e) => onChange({ ...value, work_schedule: { ...value.work_schedule, start: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-sm opacity-80">إلى</label>
          <Input
            type="time"
            value={value.work_schedule.end}
            onChange={(e) => onChange({ ...value, work_schedule: { ...value.work_schedule, end: e.target.value } })}
          />
        </div>
      </div>
    </section>
  );
}
