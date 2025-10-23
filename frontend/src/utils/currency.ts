// src/utils/currency.ts
export function formatCurrency(amount: number, currency?: string | null): string {
  const fallbackSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "SAR" ? "﷼" : "ر.ي";
  try {
    return `${new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${fallbackSymbol}`;
  } catch {
    return `${amount.toFixed(2)} ${fallbackSymbol}`;
  }
}
