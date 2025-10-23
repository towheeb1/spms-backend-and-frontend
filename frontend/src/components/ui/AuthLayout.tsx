import React from "react";
import { Button } from "./Button";

type Props = React.PropsWithChildren<{
  title: string;
  onQuickEnter?: () => void;
}>;

export function AuthLayout({ title, onQuickEnter, children }: Props) {
  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-[radial-gradient(ellipse_at_top,rgba(11,92,95,.25),transparent_60%)]">
      <div className="w-full max-w-lg">
        <div className="card rounded-2xl p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SPMS" className="h-8 w-8 rounded-lg" />
            <div className="font-bold text-lg">SPMS — {title}</div>
          </div>
          {onQuickEnter && (
            <Button variant="ghost" onClick={onQuickEnter}>
              <img src="/logo.svg" alt="" className="h-4 w-4" /> دخول سريع
            </Button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
