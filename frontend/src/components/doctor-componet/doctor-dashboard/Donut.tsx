// src/components/doctor-dashboard/Donut.tsx
import Card from "./Card";

export type PieItem = { name: string; value: number };

export default function Donut({ data }: { data: PieItem[] }) {
  const total = Math.max(1, data.reduce((s, x) => s + x.value, 0));
  let acc = 0;
  const R = 44, C = 2 * Math.PI * R;

  return (
    <Card>
      <div className="font-semibold mb-2">الأمراض الأكثر شيوعًا</div>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" className="h-44 w-44">
          <circle cx="60" cy="60" r={R} strokeWidth="16" fill="none" className="text-white/10" style={{ stroke: "currentColor" }} />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = C * frac;
            const offset = C * acc;
            acc += frac;
            return (
              <circle
                key={i}
                cx="60" cy="60" r={R} strokeWidth="16" fill="none"
                style={{ stroke: ["#60a5fa","#34d399","#fbbf24","#f472b6","#a78bfa"][i % 5] }}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <ul className="text-sm grid gap-1">
          {data.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded" style={{ background: ["#60a5fa","#34d399","#fbbf24","#f472b6","#a78bfa"][i % 5] }} />
                {d.name}
              </span>
              <span className="font-semibold">{d.value}</span>
            </li>
          ))}
          {data.length === 0 && <li className="opacity-60">لا بيانات.</li>}
        </ul>
      </div>
    </Card>
  );
}
