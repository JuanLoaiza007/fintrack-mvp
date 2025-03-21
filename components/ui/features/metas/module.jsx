"use client";

import React, { useEffect, useState } from "react";

import GoalHeader from "./header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoalForm from "./form";
import GoalMain from "./main";
import {
  addGoal,
  getGoals,
  getTransactions,
  updateGoal,
  deleteGoal,
} from "@/db/db";
import { isDateInNowMonth } from "@/lib/utils";
import GoalList from "./list";

/**
 * A module for managing and displaying goals and their associated transactions.
 *
 * @component
 * @remarks
 * This component uses React hooks such as `useState` and `useEffect` to manage state and side effects.
 * It fetches goals and transactions from a database and filters them for the current month.
 * The component also handles creating, updating, and deleting goals.
 *
 * @returns {JSX.Element} A rendered module for managing goals, including a header, main content, and modals for creating and listing goals.
 *
 * @example
 * <GoalModule />
 */
export default function GoalModule() {
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransaccions] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  /**
   * Asynchronously loads and filters goals for the current month.
   *
   * This function sets a loading state, fetches goals using the `getGoals` function,
   * filters them to include only those with a target date in the current month, and updates the state.
   * If an error occurs during the fetch, it logs the error message to the console.
   *
   * @async
   * @function loadGoals
   * @returns {Promise<void>} A promise that resolves when the goals are loaded and the state is updated.
   * @throws {Error} Throws an error if fetching the goals fails.
   *
   * @example
   * loadGoals()
   *   .then(() => console.log("Goals loaded successfully"))
   *   .catch((error) => console.error("Failed to load goals:", error));
   */
  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const goals = await getGoals();
      setGoals(goals);
      const _goals = goals.filter((g) => isDateInNowMonth(g.targetDate));
      setGoal(_goals[0] ?? null);
    } catch (error) {
      console.error(
        error?.message ?? "An error occurred while fetching the goals.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Asynchronously loads and filters transactions for the current month.
   *
   * This function sets a loading state, fetches transactions using the `getTransactions` function,
   * filters them to include only those with a date in the current month, and updates the state.
   * If an error occurs during the fetch, it logs the error message to the console.
   *
   * @async
   * @function loadTransactions
   * @returns {Promise<void>} A promise that resolves when the transactions are loaded and the state is updated.
   * @throws {Error} Throws an error if fetching the transactions fails.
   *
   * @example
   * loadTransactions()
   *   .then(() => console.log("Transactions loaded successfully"))
   *   .catch((error) => console.error("Failed to load transactions:", error));
   */
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const transactions = await getTransactions();
      const _transactions = transactions.filter((t) =>
        isDateInNowMonth(t.date),
      );
      setTransaccions(_transactions);
    } catch (error) {
      console.error(
        error?.message ?? "An error occurred while fetching the transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load goals and transactions on component mount
  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, []);

  /**
   * Handles the submission of a goal form.
   *
   * This function determines whether to create a new goal or update an existing one
   * based on the presence of a current goal. It then reloads the goals and transactions
   * to reflect the changes.
   *
   * @param {Object} data - The data submitted from the goal form (required).
   * @returns {void} Does not return a value.
   * @throws {Error} Throws an error if updating or adding a goal fails.
   *
   * @example
   * onSubmit({ title: "New Goal", targetDate: "2023-12-31", amount: 1000 });
   */
  const onSubmit = (data) => {
    if (goal) {
      updateGoal(goal.id, data);
    } else {
      addGoal(data);
    }

    loadGoals();
    loadTransactions();
  };

  /**
   * Handles the deletion of the current goal.
   *
   * This function deletes the currently selected goal by its ID and reloads the goals
   * to reflect the changes. If no goal is selected, the function does nothing.
   *
   * @async
   * @function onDelete
   * @returns {Promise<void>} A promise that resolves when the goal is deleted and the goals are reloaded.
   * @throws {Error} Throws an error if deleting the goal fails.
   *
   * @example
   * onDelete()
   *   .then(() => console.log("Goal deleted successfully"))
   *   .catch((error) => console.error("Failed to delete goal:", error));
   */
  const onDelete = async () => {
    if (goal) {
      await deleteGoal(goal.id);
      loadGoals();
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="p-4 gap-2 flex flex-col items-center justify-between w-full h-full max-h-screen overflow-y-hidden">
        <div className="p-4">
          <h1 className="font-bold text-2xl">Gestión de metas</h1>
        </div>
        <GoalHeader
          onOpenCreate={setIsCreateOpen}
          onListOpen={setIsListOpen}
          onDelete={onDelete}
          goal={goal}
        />
        <GoalMain goal={goal} transactions={transactions} />
      </div>
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{goal ? "Editar Meta" : "Crear Meta"}</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <GoalForm
              goal={goal}
              onSubmit={onSubmit}
              setIsCreateOpen={setIsCreateOpen}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={isListOpen} onOpenChange={(open) => setIsListOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Metas</DialogTitle>
            <GoalList goals={goals} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
