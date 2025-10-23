import React, { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type SelectProps = {
  value?: string | number | null;
  onChange?: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  optionClassName?: string;
  dir?: "rtl" | "ltr";
};

// A fully styled custom Select. Keyboard + mouse supported. No external deps.
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "اختر...",
  disabled,
  className = "",
  menuClassName = "",
  optionClassName = "",
  dir = "rtl",
}) => {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const suppressNextToggleRef = useRef(false);

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    setHighlightIndex(() => {
      const idx = options.findIndex((o) => o.value === value && !o.disabled);
      return idx >= 0 ? idx : options.findIndex((o) => !o.disabled);
    });
  }, [open, options, value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      let i = highlightIndex;
      do {
        i = (i + 1) % options.length;
      } while (options[i]?.disabled && i !== highlightIndex);
      setHighlightIndex(i);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      let i = highlightIndex;
      do {
        i = (i - 1 + options.length) % options.length;
      } while (options[i]?.disabled && i !== highlightIndex);
      setHighlightIndex(i);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlightIndex];
      if (opt && !opt.disabled) {
        onChange?.(opt.value);
        setOpen(false);
      }
    }
  }

  function handleSelect(val: string | number) {
    onChange?.(val);
    suppressNextToggleRef.current = true;
    setOpen(false);
  }

  return (
    <div ref={containerRef} dir={dir} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (suppressNextToggleRef.current) {
            suppressNextToggleRef.current = false;
            return;
          }
          setOpen((v) => !v);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-right flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white/15"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${selected ? "text-white" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="shrink-0 text-gray-400">▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 mt-1 w-full rounded-xl border border-white/15 bg-[#111827] text-white shadow-lg overflow-hidden ${menuClassName}`}
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map((o, idx) => {
              const active = idx === highlightIndex;
              const selectedNow = o.value === value;
              return (
                <div
                  key={`${o.value}`}
                  role="option"
                  aria-selected={selectedNow}
                  onMouseEnter={() => !o.disabled && setHighlightIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!o.disabled) handleSelect(o.value);
                  }}
                  className={`px-3 py-2 cursor-pointer ${o.disabled ? "opacity-50 cursor-not-allowed" : ""} ${active ? "bg-blue-600/30" : "hover:bg-white/10"} ${selectedNow ? "bg-blue-600/40" : ""} ${optionClassName}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{o.label}</span>
                    {selectedNow && <span className="text-blue-300">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
