"use client";
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Displays a budget summary with expenses, progress, and action buttons.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Object[]} props.expenses - List of expense transactions.
 * @param {number} props.expenses[].amount - The amount of the expense.
 * @param {string} props.expenses[].date - The date of the expense in ISO format.
 * @param {Object} [props.budget] - The budget object (optional).
 * @param {number} props.budget.amount - The total budget amount.
 * @param {Function} props.onOpenCreate - Callback function to open the budget creation modal.
 * @param {Function} props.onDelete - Callback function to delete the budget.
 * @remarks Uses `useEffect` to display a toast notification based on spending percentage.
 * @returns {JSX.Element} A UI component displaying budget details and controls.
 *
 * @example
 * <BudgetHeader
 *   expenses={[
 *     { amount: 50, date: "2025-03-01T12:00:00Z" },
 *     { amount: 30, date: "2025-03-05T15:30:00Z" }
 *   ]}
 *   budget={{ amount: 500 }}
 *   onOpenCreate={() => console.log("Open budget modal")}
 *   onDelete={() => console.log("Delete budget")}
 * />
 */
export default function BudgetHeader({
  expenses,
  budget,
  onOpenCreate,
  onDelete,
}) {
  /**
   * Reference to track the last displayed toast message.
   *
   * @type {React.MutableRefObject<string | null>}
   * @remarks Prevents duplicate toast messages when the spending percentage changes.
   *
   * @example
   * lastToastRef.current = "🚨 Warning: Budget limit is near!";
   */
  const lastToastRef = useRef(null);
  /**
   * Retrieves the total budget amount or defaults to zero.
   *
   * @returns {number} The total budget amount, defaulting to 0 if not provided.
   *
   * @example
   * console.log(totalBudget); // 500
   */
  const totalBudget = budget?.amount || 0;

  /**
   * Calculates the total expenses for the current month.
   *
   * @param {Array<{ date: string, amount: number }>} expenses - List of expenses.
   * @returns {number} The sum of all expenses for the current month.
   *
   * @example
   * const expenses = [
   *   { date: "2025-03-01", amount: 50 },
   *   { date: "2025-03-15", amount: 100 },
   * ];
   * console.log(totalExpenses(expenses)); // 150
   */
  const totalExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return (
        expenseDate.getFullYear() === now.getFullYear() &&
        expenseDate.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  /**
   * Computes the spending percentage based on total expenses and budget.
   *
   * @returns {number} The percentage of the budget that has been spent, capped at 100%.
   *
   * @example
   * console.log(spendingPercentage); // e.g., 50
   */
  const spendingPercentage =
    totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0;

  /**
   * Determines the color representation based on the spending percentage.
   *
   * @returns {string} A hexadecimal color code representing the spending level.
   *
   * @example
   * console.log(getColor()); // e.g., "#F59E0B" if spending is between 50% and 75%
   */
  const getColor = () => {
    const pct = Number(spendingPercentage);
    if (pct < 25) return "#16A34A";
    if (pct >= 25 && pct < 50) return "#CA8A04";
    if (pct >= 50 && pct < 75) return "#F59E0B";
    if (pct >= 75 && pct < 100) return "#DC2626";
    return "#7F1D1D";
  };

  // Displays a toast notification based on the spending percentage.
  useEffect(() => {
    if (!budget) return;
    let message = null;

    if (spendingPercentage < 25) {
      message = "💰 Aún tienes la mayor parte de tu presupuesto disponible.";
    } else if (spendingPercentage >= 25 && spendingPercentage < 50) {
      message =
        "📊 Has gastado una parte de tu presupuesto, adminístralo bien.";
    } else if (spendingPercentage >= 50 && spendingPercentage < 75) {
      message = "⚠️ Más de la mitad de tu presupuesto ha sido utilizado.";
    } else if (spendingPercentage >= 75 && spendingPercentage < 100) {
      message = "🚨 ¡Cuidado! Te queda menos del 25% de tu presupuesto.";
    } else if (spendingPercentage >= 100) {
      message = "❌ Has superado tu presupuesto. ¡Revisa tus gastos!";
    }

    if (message && lastToastRef.current !== message) {
      toast.dismiss();
      toast(message, { position: "bottom-right" });
      lastToastRef.current = message;
    }
  }, [spendingPercentage, budget]);

  const color = getColor();

  return (
    <>
      <div className="flex w-full items-center justify-center gap-16">
        <div className="text-center">
          <p className="text-lg">Tú presupuesto es de:</p>
          <h3 className="text-5xl font-bold">
            ${totalBudget.toLocaleString()}
          </h3>
        </div>
        <div className="text-center">
          <p className="text-lg text-gray-500">Total gastado este mes:</p>
          <h3 className="text-4xl font-semibold text-red-500">
            ${totalExpenses.toLocaleString()}
          </h3>
        </div>
      </div>
      <div className="mt-4 w-3/4 mx-auto">
        <Progress value={spendingPercentage} color={color} />
        <p className="text-center mt-2 text-gray-600">
          Has gastado{" "}
          <span className="font-semibold">
            {spendingPercentage.toFixed(1)}%
          </span>{" "}
          de tu presupuesto.
        </p>
      </div>
      <div className="flex w-full items-center justify-center gap-4 mt-4">
        <Button onClick={() => onOpenCreate(true)} disabled={budget}>
          <Plus className="w-6 h-6" />
          Define tu presupuesto
        </Button>
        <Button
          onClick={() => onOpenCreate(true)}
          size="icon"
          className="bg-yellow-400 text-white hover:bg-yellow-500"
        >
          <Edit className="w-6 h-6" />
        </Button>
        <Button size="icon" variant="destructive" onClick={onDelete}>
          <Trash2 className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
}
