/**
 * Currency formatting utilities for BDT (Bangladeshi Taka)
 */

/**
 * Format a number as BDT currency with the ৳ symbol
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string with ৳ symbol
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const decimals = showDecimals ? 2 : 0;
  return `৳${amount.toFixed(decimals)}`;
}

/**
 * Format a number as BDT currency without symbol (for calculations)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted number string without currency symbol
 */
export function formatAmount(amount: number, showDecimals: boolean = true): string {
  const decimals = showDecimals ? 2 : 0;
  return amount.toFixed(decimals);
}

/**
 * Format a number with thousand separators and ৳ symbol
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string with thousand separators
 */
export function formatCurrencyWithSeparators(amount: number, showDecimals: boolean = true): string {
  const decimals = showDecimals ? 2 : 0;
  return `৳${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/**
 * Currency symbol constant
 */
export const CURRENCY_SYMBOL = '৳';

/**
 * Currency code constant
 */
export const CURRENCY_CODE = 'BDT';
