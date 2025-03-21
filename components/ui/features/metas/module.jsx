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

export default function GoalModule() {
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransaccions] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

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

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, []);

  const onSubmit = (data) => {
    if (goal) {
      updateGoal(goal.id, data);
    } else {
      addGoal(data);
    }

    loadGoals();
    loadTransactions();
  };

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
