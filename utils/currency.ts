const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
};

/**
 * Returns a display symbol for a currency code.
 * Supported: USD ($), INR (₹). Falls back to "$" when unknown.
 */
export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) {
    return CURRENCY_SYMBOLS.USD;
  }

  const code = currency.trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] ?? CURRENCY_SYMBOLS.USD;
}
