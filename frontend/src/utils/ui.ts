export type UiSettings = {
  rtl: boolean
  theme: "system" | "dark" | "light"
  language?: "ar" | "en"
  textScale?: number
}
export const SETTINGS_KEY = "spms.settings"

export function applyUiSettings(s: UiSettings) {
  const root = document.documentElement
  root.setAttribute("dir", s.rtl ? "rtl" : "ltr")
  root.setAttribute("lang", s.language || (s.rtl ? "ar" : "en"))

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark)
  root.classList.toggle("dark", isDark)

  if (s.textScale) root.style.setProperty("--spms-text-scale", String(s.textScale / 100))
}

export function loadSettings<T = any>(defaults: T): T {
  try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) return { ...defaults, ...JSON.parse(raw) } } catch {}
  return defaults
}
export function saveSettings(s: any) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {} }
