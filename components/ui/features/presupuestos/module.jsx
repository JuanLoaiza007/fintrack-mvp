"use client";
import React, { useState, useEffect } from "react";
import {
  getTransactions,
  updateBudget,
  addBudget,
  getBudget,
  deleteBudget,
} from "@/db/db";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BudgetHeader from "./header";
import BudgetExpenses from "./expenses";
import BudgetForm from "./form";

/**
 * BudgetModule component.
 *
 * This component provides a complete budget management module, allowing users to view, create, update, and delete budgets.
 *
 * @component
 * @remarks This component uses multiple state variables and effects to handle data fetching and UI updates.
 * It interacts with the database to fetch and update budget-related information.
 *
 * @returns {JSX.Element} A structured UI for managing budgets, including a header, expense list, and budget form.
 *
 * @example
 * // Example usage:
 * import BudgetModule from './BudgetModule';
 *
 * function App() {
 *   return <BudgetModule />;
 * }
 */
export default function BudgetModule() {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches and updates the list of expense transactions.
   *
   * @async
   * @throws {Error} If there is an issue retrieving transactions.
   * @returns {Promise<void>} Resolves once the expenses are updated.
   *
   * @example
   * await fetchExpenses();
   */
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setExpenses(data.filter((t) => t.type === "expense"));
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Fetches and sets the current budget data.
   *
   * @async
   * @throws {Error} If there is an issue retrieving the budget.
   * @returns {Promise<void>} Resolves once the budget is set.
   *
   * @example
   * await fetchBudget();
   */
  const fetchBudget = async () => {
    try {
      const data = await getBudget();
      setBudget(data[0]);
    } catch (error) {
      console.error("Error al obtener presupuesto:", error);
    }
  };

  /**
   * Handles form submission to create or update a budget.
   *
   * @async
   * @param {Object} data - The budget data to be saved (required).
   * @throws {Error} If there is an issue saving the budget.
   * @returns {Promise<void>} Resolves once the budget is saved and state is updated.
   *
   * @example
   * await onSubmit({ amount: 500, category: "Food" });
   */
  const onSubmit = async (data) => {
    try {
      if (budget) {
        await updateBudget(budget.id, data);
      } else {
        await addBudget(data);
      }
      setIsCreateOpen(false);
      fetchExpenses();
      fetchBudget();
    } catch (error) {
      console.error("Error al guardar el presupuesto:", error);
    }
  };

  /**
   * Deletes the current budget if it exists.
   *
   * @async
   * @throws {Error} If there is an issue deleting the budget.
   * @returns {Promise<void>} Resolves once the budget is deleted and state is updated.
   *
   * @example
   * await onDelete();
   */
  const onDelete = async () => {
    if (budget) {
      await deleteBudget(budget.id);
      fetchBudget();
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);
  return (
    <div className="p-4 gap-2 flex flex-col items-center justify-between w-full h-full max-h-screen overflow-y-hidden">
      <h2 className="text-2xl font-bold text-gray-800 mt-4">
        Presupuesto mensual
      </h2>
      <BudgetHeader
        expenses={expenses}
        budget={budget}
        onOpenCreate={setIsCreateOpen}
        onDelete={onDelete}
      />
      {loading ? (
        <p>Cargando gastos...</p>
      ) : (
        <BudgetExpenses expenses={expenses} />
      )}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {budget ? "Editar Presupuesto" : "Crear Presupuesto"}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <BudgetForm
              budget={budget}
              onSubmit={onSubmit}
              setIsCreateOpen={setIsCreateOpen}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
