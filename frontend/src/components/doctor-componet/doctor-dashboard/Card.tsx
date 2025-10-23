// src/components/doctor-dashboard/Card.tsx
import React from "react";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card rounded-2xl p-4 bg-white/5 ${className}`}>{children}</div>
  );
}
