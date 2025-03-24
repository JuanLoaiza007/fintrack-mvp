"use client";
import React from "react";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} from "@/components/schemas/transaccion";

/**
 * Displays a list of budget expenses for the current month.
 *
 * This component filters and displays a list of expenses that occurred within the current month.
 * It utilizes helper functions to format dates and retrieve labels for transaction types and categories.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Array<{id: number, description: string, amount: number, type: string, category: string, essential: boolean, date: string}>} props.expenses - An array of expense objects. Required.
 * @returns {JSX.Element} A section displaying the list of expenses or a message if there are no expenses for the current month.
 *
 * @example
 * const expenses = [
 * {
 * id: 1,
 * description: "Groceries",
 * amount: 100,
 * type: "expense",
 * category: "food",
 * essential: true,
 * date: "2025-03-01T12:00:00Z"
 * }
 * ];
 *
 * <BudgetExpenses expenses={expenses} />
 */
export default function BudgetExpenses({ expenses }) {
  const now = new Date();

  /**
   * Gets the display label for a given transaction type.
   *
   * This function retrieves the corresponding label for a transaction type from the TRANSACTION_TYPES array.
   * If the type is not found, it returns "Desconocido".
   *
   * @param {string} type - The transaction type value (e.g., "income" or "expense").
   * @returns {string} The corresponding label (e.g., "Ingresos" or "Gastos").
   *
   * @example
   * const label = getTypeLabel("expense"); // Returns "Gastos" or "Desconocido"
   */
  const getTypeLabel = (type) => {
    return (
      TRANSACTION_TYPES.find((t) => t.value === type)?.label || "Desconocido"
    );
  };

  /**
   * Gets the display label for a given transaction category.
   *
   * This function retrieves the corresponding label for a transaction category from the TRANSACTION_CATEGORIES array.
   * If the category is not found, it returns "Otros".
   *
   * @param {string} category - The transaction category value.
   * @returns {string} The corresponding label (e.g., "Comida y Bebida").
   *
   * @example
   * const label = getCategoryLabel("food"); // Returns "Comida y Bebida" or "Otros"
   */
  const getCategoryLabel = (category) => {
    return (
      TRANSACTION_CATEGORIES.find((c) => c.value === category)?.label || "Otros"
    );
  };

  /**
   * Filters expenses to include only those from the current month.
   *
   * This function filters an array of expenses to return only those expenses that occurred within the current month.
   *
   * @function
   * @param {Array<{date: string}>} expenses - The list of expenses. Required. Each expense object must contain a 'date' property in ISO format.
   * @returns {Array<{id: number, description: string, amount: number, type: string, category: string, essential: boolean, date: string}>} A filtered array containing only expenses from the current month.
   *
   * @example
   * const monthlyExpenses = currentMonthExpenses(expenses);
   * console.log(monthlyExpenses); // [{ id: 1, date: "2025-03-15T12:00:00Z", ... }]
   */
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getFullYear() === now.getFullYear() &&
      expenseDate.getMonth() === now.getMonth()
    );
  });
  /**
   * Formats a date string into a human-readable format.
   *
   * This function converts a date string in ISO format to a "DD/MM/YYYY" format.
   * @function
   * @param {string} dateString - The date in ISO format. Required.
   * @returns {string} The formatted date string in "DD/MM/YYYY" format.
   *
   * @example
   * const formattedDate = formatDate("2025-03-15T12:00:00Z");
   * console.log(formattedDate); // "15/03/2025"
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return (
    <div className="flex flex-col w-full h-full max-h-[68vh] bg-sidebar-accent rounded-lg shadow-lg p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Gastos del mes</h2>
      {currentMonthExpenses.length === 0 ? (
        <p className="text-gray-500 text-center">
          No hay gastos registrados este mes.
        </p>
      ) : (
        currentMonthExpenses.map((expense) => (
          <section
            key={expense.id}
            className="w-full border p-4 rounded bg-white shadow mb-4"
          >
            <div className="border p-3 rounded">
              <h4 className="font-bold">
                {expense.description} - ${expense.amount.toLocaleString()}
              </h4>
              <p className="text-sm text-gray-600">
                {getTypeLabel(expense.type)} -{" "}
                {getCategoryLabel(expense.category)}{" "}
                {expense.essential ? "(Esencial)" : "(No esencial)"}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(expense.date)}
              </p>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
