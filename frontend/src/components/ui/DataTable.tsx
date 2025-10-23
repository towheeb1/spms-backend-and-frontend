import React from "react";

export type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  rowKey?: (row: T, idx: number) => React.Key;
  className?: string;
};

export function DataTable<T>({ columns, rows, emptyText = "لا توجد بيانات", rowKey, className = "" }: Props<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-white/20">
            {columns.map((c) => (
              <th key={String(c.key)} className="pb-3 text-sm font-medium">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center opacity-70">{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey ? rowKey(row, i) : i} className="hover:bg-white/5 transition-colors">
                {columns.map((c) => (
                  <td key={String(c.key)} className={`py-3 ${c.className || ""}`}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
