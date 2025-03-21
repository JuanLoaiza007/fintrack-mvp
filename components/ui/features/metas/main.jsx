"use client";

import { Goal } from "./goal";

/**
 * Renders the main container for a goal and its associated transactions.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {Object} props.goal - The goal object to display. Required.
 * @param {Array} props.transactions - The list of transactions related to the goal. Required.
 * @returns {JSX.Element} The rendered component displaying the goal and its transactions.
 * @remarks This component uses the `Goal` component to render the goal details and transactions.
 * @example
 * const goal = { id: 1, name: "Save for a car", target: 5000 };
 * const transactions = [
 *   { id: 1, amount: 200, date: "2023-01-01" },
 *   { id: 2, amount: 150, date: "2023-01-15" }
 * ];
 *
 * <GoalMain goal={goal} transactions={transactions} />
 */
export default function GoalMain({ goal, transactions }) {
  return (
    <div className="flex flex-col w-full h-full bg-sidebar-accent rounded-lg shadow-lg p-4">
      <Goal goal={goal} transactions={transactions} />
    </div>
  );
}
