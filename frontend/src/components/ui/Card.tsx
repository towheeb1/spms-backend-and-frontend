import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export function Card({ className = "", children }: Props) {
  return (
    <div className={`card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 ${className}`}>
      {children}
    </div>
  );
}
