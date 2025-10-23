import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <h4 className="mb-3 text-sm font-semibold opacity-80">{title}</h4>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="opacity-80">{label}</span>
      {children}
      {hint ? <span className="text-xs opacity-60">{hint}</span> : null}
    </label>
  );
}
