import { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "../../progress";

/**
 * Displays a savings goal and its progress based on transactions.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.goal - The savings goal object, containing `amount` (required) and `description` (optional).
 * @param {Array} props.transactions - The list of transactions to calculate progress from (optional, default is an empty array).
 * @returns {JSX.Element} A component that renders the savings goal and progress.
 * @remarks This component uses `useMemo` to optimize calculations and `useEffect` to display toast notifications based on progress.
 * @example
 * const goal = { amount: 5000, description: "Vacation savings" };
 * const transactions = [
 *   { type: "income", amount: 2000 },
 *   { type: "income", amount: 1000, category: "savings" },
 * ];
 *
 * <Goal goal={goal} transactions={transactions} />
 */
export function Goal({ goal, transactions }) {
  // Calculating the total saved amount
  const totalSaved = useMemo(
    () =>
      transactions
        ?.filter((t) => t.type === "income" || t.type === "expense")
        .reduce((sum, t) => {
          if (t.type === "expense") {
            return sum - t.amount; // Resta si es "expense"
          }
          return sum + t.amount; // Suma si es "income"
        }, 0),
    [transactions],
  );

  // Calculating the percentage of the goal reached
  const percent =
    Math.min((totalSaved / goal?.amount ?? 1) * 100, 100).toFixed(0) || 0;

  /**
   * Determines the color based on the percentage of the goal reached.
   *
   * @param {string} percent - The percentage of the goal reached (required).
   * @returns {string} The color code corresponding to the percentage.
   *
   * @example
   * const color = getColor("80");
   * console.log(color); // "#16A34A"
   */
  const getColor = () => {
    const pct = Number(percent);
    if (pct >= 75) return "#16A34A";
    if (pct >= 50) return "#2563EB";
    if (pct >= 25) return "#CA8A04";
    return "#DC2626";
  };

  // Display a toast message based on the percentage reached
  useEffect(() => {
    const pct = +percent;
    if (pct < 25) {
      toast("😟 Aún estás lejos de tu meta de ahorro.");
    } else if (pct >= 75 && pct < 100) {
      toast("🎉 ¡Casi alcanzas tu meta!");
    } else if (pct >= 100) {
      toast("🎉 ¡Felicidades! Has alcanzado tu meta de ahorro.");
    }
  }, [percent]);

  const color = getColor();

  if (!goal) {
    return (
      <div className="flex flex-col w-full h-full rounded-lg shadow-lg bg-white justify-center items-center">
        <h2 className="font-bold text-xl">Meta de ahorro</h2>
        <p className="text-gray-500">No hay meta registrada para este mes.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      <div className="flex flex-col w-full rounded-lg shadow-lg bg-white p-6 justify-center items-center">
        <h2 className="font-bold text-xl mb-2">Meta de ahorro</h2>
        <p className={`text-4xl font-extrabold text-green-600`}>
          {formatCurrency(goal?.amount)}
        </p>
        <p className="mt-2 text-lg text-gray-700">{goal?.description}</p>
      </div>
      <div className="flex flex-col w-full rounded-lg shadow-lg bg-white p-6 justify-center items-center">
        <h2 className="font-bold text-xl mb-2">Progreso ({percent}%)</h2>
        <p className={`text-4xl font-extrabold mb-2`} style={{ color }}>
          {formatCurrency(totalSaved)}
        </p>
        <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden">
          <Progress value={percent} color={color} />
        </div>
      </div>
    </div>
  );
}
