import { ScrollArea } from "../../scroll-area";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CircleX, Goal, Loader } from "lucide-react";

const STATUS_VARIANT = {
  "in-progress": "outline",
  completed: "default",
  failure: "destructive",
};

const STATUS_STYLES = {
  "in-progress": "",
  completed: "text-green-800",
  failure: "text-red-800",
};

const STATUS_LABELS = {
  "in-progress": "EN PROGRESO",
  completed: "COMPLETADA",
  failure: "FALLIDA",
};

const STATUS_ICONS = {
  "in-progress": Loader,
  completed: Goal,
  failure: CircleX,
};

function GoalListItem({ goal }) {
  const badgeType = STATUS_VARIANT[goal.completed] || "default";
  const badgeClass = STATUS_STYLES[goal.completed] || "";
  const Icon = STATUS_ICONS[goal.completed];

  return (
    <div className="flex items-center justify-between w-full p-4 bg-white rounded-lg border-b-2 border-gray-100">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-gray-600" />
        <p className="text-sm text-gray-600">{goal.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={badgeType} className={badgeClass}>
          {STATUS_LABELS[goal.completed]}
        </Badge>
        <p className="text-lg font-semibold text-gray-900">
          {formatCurrency(goal.amount)}
        </p>
      </div>
    </div>
  );
}

export default function GoalList({ goals }) {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg">
      <ScrollArea className="flex flex-col mt-4 space-y-3">
        {goals.length > 0 ? (
          goals.map((goal) => <GoalListItem key={goal.id} goal={goal} />)
        ) : (
          <p className="text-gray-500 text-center mt-8">
            No hay metas registradas.
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
