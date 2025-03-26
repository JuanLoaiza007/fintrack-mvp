import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a given amount as a currency string in Colombian Pesos (COP).
 *
 * @param {number} amount - The amount to format (required).
 * @returns {string} The formatted currency string in COP.
 * @example
 * // Returns "$10,000.00"
 * formatCurrency(10000);
 *
 * // Returns "$1,234,567.89"
 * formatCurrency(1234567.89);
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
}

/**
 * Checks if a given date string corresponds to the current month and year.
 *
 * @param {string} stringDate - The date string to check (required, in a format parsable by `Date`).
 * @returns {boolean} True if the date is in the current month and year, otherwise false.
 * @example
 * // Returns true if today's date is in October 2023
 * isDateInNowMonth("2023-10-15");
 *
 * // Returns false if today's date is not in December 2023
 * isDateInNowMonth("2023-12-01");
 */
export function isDateInNowMonth(stringDate) {
  const date = new Date(stringDate);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}
