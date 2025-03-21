"use client";

import { Goal } from "./goal";

export default function GoalMain({ goal, transactions }) {
  return (
    <div className="flex flex-col w-full h-full bg-sidebar-accent rounded-lg shadow-lg p-4">
      <Goal goal={goal} transactions={transactions} />
    </div>
  );
}
