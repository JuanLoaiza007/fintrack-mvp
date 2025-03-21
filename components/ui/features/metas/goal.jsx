import { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "../../progress";

export function Goal({ goal, transactions }) {
  const totalSaved = useMemo(
    () =>
      transactions
        ?.filter((t) => t.type === "income" || t.category === "savings")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const percent =
    Math.min((totalSaved / goal?.amount ?? 1) * 100, 100).toFixed(0) || 0;

  const getColor = () => {
    const pct = Number(percent);
    if (pct >= 75) return "#16A34A";
    if (pct >= 50) return "#2563EB";
    if (pct >= 25) return "#CA8A04";
    return "#DC2626";
  };

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
