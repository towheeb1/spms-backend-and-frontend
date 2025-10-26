// src/utils/currency.ts
const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  SAR: "SAR",
  AED: "AED",
};

export function formatCurrency(amount: number, currency?: string | null): string {
  const code = (currency ?? "SAR").toUpperCase();
  const symbol = SYMBOLS[code] ?? code;
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ${symbol}`;
  } catch {
    return `${amount.toFixed(2)} ${symbol}`;
  }
}
