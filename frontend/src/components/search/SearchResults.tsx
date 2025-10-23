// src/components/search/SearchResults.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "../../store/search";


export function SearchResults() {
  const { query, results, loading, open, setOpen } = useSearch();
  const nav = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // لا تظهر إن لم تكن مفتوحة أو طول النص أقل من 2
  const visible = open && (query?.trim().length ?? 0) >= 2;

  // تجميع النتائج بحسب النوع
  const groups = useMemo(() => {
    const g: Record<string, typeof results> = {};
    for (const r of results) (g[r.type] ||= []).push(r);
    return g;
  }, [results]);

  const labels: Record<string, string> = {
    prescriptions: "الوصفات",
    orders: "الطلبات",
    invoices: "الفواتير",
    payments: "المدفوعات",
    profile: "الملف",
    addresses: "العناوين",
    insurance: "التأمين",
    pharmacies: "الصيدليات",
    settings: "الإعدادات",
  };

  // إغلاق بالنقر خارج/بالـ Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!visible) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        const r = results[active];
        if (r) { setOpen(false); nav(r.route); }
      }
    }
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [visible, results, active, setOpen, nav]);

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      className="absolute z-50 mt-2 w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-2xl"
      role="listbox"
      aria-label="نتائج البحث"
    >
      {/* رأس */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="font-semibold text-sm opacity-90">نتائج البحث</div>
        <div className="text-xs opacity-60 hidden sm:block">Enter اختيار • Esc إغلاق • ↑↓ تنقّل</div>
      </div>

      {/* جسم */}
      <div className="max-h-[60vh] overflow-auto py-2">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm opacity-70">جاري البحث…</div>
        ) : results.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm opacity-70">
            لا نتائج لـ <span className="font-medium">“{query.trim()}”</span>.
            <div className="mt-1">جرّب كلمات أقل أو تهجئة مختلفة.</div>
          </div>
        ) : (
          Object.entries(groups).map(([type, arr]) => (
            <div key={type} className="px-2 py-2">
              <div className="px-2 pb-1 text-xs uppercase tracking-wider opacity-60">
                {labels[type] || type}
              </div>
              <ul className="grid">
                {arr.map((r, idxInGroup) => {
                  const flatIndex =
                    arr.slice(0, idxInGroup).reduce((n) => n + 1, 0) +
                    Object.values(groups)
                      .slice(0, Object.keys(groups).indexOf(type))
                      .reduce((n, a) => n + a.length, 0);
                  const isActive = active === flatIndex;
                  return (
                    <li key={`${r.type}-${r.id}`}>
                      <Link
                        to={r.route}
                        onClick={() => setOpen(false)}
                        className={`block rounded-xl px-3 py-2 transition ${
                          isActive ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActive(flatIndex)}
                      >
                        <div className="font-medium line-clamp-1">{r.title}</div>
                        {r.subtitle && (
                          <div className="opacity-70 text-xs line-clamp-1">{r.subtitle}</div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

        
    </div>
  );
}
