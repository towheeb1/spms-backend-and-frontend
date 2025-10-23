// يحوّل الأرقام العربية/الفارسية إلى 0-9
export function toWesternDigits(input: string) {
  const map: Record<string, string> = {
    // Arabic-Indic
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
    // Eastern Arabic-Indic
    '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9',
  }
  return input.replace(/[٠-٩۰-۹]/g, (d) => map[d]).replace(/[^\d]/g, '')
}
