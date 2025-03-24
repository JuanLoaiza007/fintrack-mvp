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
   * This function retrieves transactions from the database, filters only expenses,
   * and updates the component state accordingly.
   *
   * @async
   * @function fetchExpenses
   * @returns {Promise<void>} A promise that resolves once the expenses are updated.
   * @throws {Error} Logs an error if retrieving transactions fails.
   *
   * @example
   * fetchExpenses()
   *   .then(() => console.log("Expenses fetched successfully"))
   *   .catch((error) => console.error("Failed to fetch expenses:", error));
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
   * Retrieves budget details from the database and updates the state with the first available budget.
   *
   * @async
   * @function fetchBudget
   * @returns {Promise<void>} A promise that resolves once the budget is set.
   * @throws {Error} Logs an error if retrieving the budget fails.
   *
   * @example
   * fetchBudget()
   *   .then(() => console.log("Budget fetched successfully"))
   *   .catch((error) => console.error("Failed to fetch budget:", error));
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
   * If an existing budget is present, it updates it. Otherwise, it creates a new budget.
   * After completion, it refreshes the budget and expenses data.
   *
   * @async
   * @function onSubmit
   * @param {Object} data - The budget data to be saved.
   * @param {number} data.amount - The budget amount.
   * @param {string} data.category - The category associated with the budget.
   * @returns {Promise<void>} A promise that resolves once the budget is saved and state is updated.
   * @throws {Error} Logs an error if saving the budget fails.
   *
   * @example
   * onSubmit({ amount: 500, category: "Food" })
   *   .then(() => console.log("Budget saved successfully"))
   *   .catch((error) => console.error("Failed to save budget:", error));
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
   * If a budget is available, this function deletes it and refreshes the budget data.
   *
   * @async
   * @function onDelete
   * @returns {Promise<void>} A promise that resolves once the budget is deleted and state is updated.
   * @throws {Error} Logs an error if deleting the budget fails.
   *
   * @example
   * onDelete()
   *   .then(() => console.log("Budget deleted successfully"))
   *   .catch((error) => console.error("Failed to delete budget:", error));
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
