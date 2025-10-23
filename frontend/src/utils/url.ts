// src/utils/url.ts
// يحوّل أي مسار (مثل /uploads/.. أو uploads/..) إلى رابط كامل على خادم الـAPI
export function absoluteApiUrl(p?: string): string {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p; // لو أصلاً رابط كامل

  const base =
    (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

  const cleanBase = String(base).replace(/\/+$/, "");
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  return `${cleanBase}${cleanPath}`;
}
