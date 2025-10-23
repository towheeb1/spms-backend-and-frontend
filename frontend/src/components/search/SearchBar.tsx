import { useEffect, useRef, useState } from "react";
import { useSearch } from "../../store/search";
import { FiltersPanel } from "./FiltersPanel"; // كان ././FiltersPanel
import { runAccountSearch } from "../../pages/patient/search-sources";
import { SearchResults } from "./SearchResults";
import { BarcodeScanner } from "../ui/BarcodeScanner";

export function SearchBar(props?: { onSearchFocus?: () => void; onSearchBlur?: () => void }) {
  const {
    query,
    setQuery,
    filters,
    setResults,
    setOpen,
    loading,
    setLoading, // تأكد أنها موجودة في store
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);

  const placeholder = "ابحث في حسابك: وصفة، فاتورة، عنوان، تأمين…";

  async function exec(q: string) {
    const id = ++reqIdRef.current;
    setLoading(true);
    try {
      const res = await runAccountSearch(q, filters);
      // تجاهل نتيجة قديمة إن وُجد طلب أحدث
      if (id !== reqIdRef.current) return;
      setResults(res);
      setOpen(q.trim().length >= 2); // تظهر فقط أثناء الكتابة
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }

  // تشغيل البحث مع إلغاء الاهتزاز + شرط الحد الأدنى
  useEffect(() => {
    const q = query.trim();

    // أقل من حرفين: إخفاء وإفراغ
    if (q.length < 2) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      setOpen(false);
      setResults([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      exec(q);
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, filters]); // تغيّر الفلاتر يعيد البحث

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
          {loading ? "⏳" : "🔎"}
        </span>

        <input
          type="search"
          className="w-full px-9 pr-14 py-2 rounded-2xl bg-white/10 outline-none focus:ring-2 focus:ring-white/20"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
            props?.onSearchFocus?.();
          }}
  />

        {/* Camera button inside the input (right side) */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          title="مسح باركود"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-white/6 hover:bg-white/12 transition-colors"
        >
          <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-2h8l2 2h3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            <circle cx="12" cy="13" r="3" strokeWidth="1.6" />
          </svg>
        </button>

        {/* القائمة المنسدلة يجب أن تكون داخل نفس الحاوية النسبية */}
        <SearchResults />
      </div>

      <button
        onClick={() => setShowFilters(true)}
        className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20"
      >
        فلترة
      </button>

      {showFilters && <FiltersPanel onClose={() => setShowFilters(false)} />}

      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            setQuery(code || "");
            setShowScanner(false);
            // trigger search immediately
            if ((code || "").trim().length >= 2) {
              exec((code || "").trim());
            }
          }}
          onClose={() => setShowScanner(false)}
          hashBarcode={true}
        />
      )}
    </div>
  );
}
