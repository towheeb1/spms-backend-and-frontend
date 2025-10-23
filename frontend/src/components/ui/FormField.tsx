import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string | null;
  className?: string;
};

export function FormField({ label, children, hint, error, className = "" }: Props) {
  return (
    <div className={`grid gap-1 ${className}`}>
      <label className="text-sm opacity-80">{label}</label>
      {children}
      {hint && !error && <div className="text-xs opacity-60">{hint}</div>}
      {error && <div className="text-xs" style={{ color: "#ef4444" }}>{error}</div>}
    </div>
  );
}
