// src/components/doctor-dashboard/MiniCalendar.tsx
import Card from "./Card";

export default function MiniCalendar({ date = new Date() }: { date?: Date }) {
  const y = date.getFullYear(), m = date.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(y, m, 1 - ((first.getDay() + 6) % 7));
  const days = [...Array(42)].map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const isSame = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const today = new Date();

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">التقويم</div>
        <div className="text-xs opacity-70">
          {date.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-70 mb-1">
        {["ن", "ث", "ر", "خ", "ج", "س", "ح"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === m;
          const todayFlag = isSame(d, today);
          return (
            <div key={i} className={`py-1 rounded ${inMonth ? "bg-white/5" : "opacity-40"} ${todayFlag ? "ring-2 ring-blue-500" : ""}`}>
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
