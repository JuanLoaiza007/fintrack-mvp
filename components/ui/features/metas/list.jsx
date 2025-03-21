import { ScrollArea } from "../../scroll-area";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CircleX, Goal, Loader } from "lucide-react";

/**
 * Constants for the goal status variants
 */
const STATUS_VARIANT = {
  "in-progress": "outline",
  completed: "default",
  failure: "destructive",
};

/**
 * Constants for the goal status styles
 */
const STATUS_STYLES = {
  "in-progress": "",
  completed: "text-green-800",
  failure: "text-red-800",
};

/**
 * Constants for the goal status labels
 */
const STATUS_LABELS = {
  "in-progress": "EN PROGRESO",
  completed: "COMPLETADA",
  failure: "FALLIDA",
};

/**
 * Constants for the goal status icons
 */
const STATUS_ICONS = {
  "in-progress": Loader,
  completed: Goal,
  failure: CircleX,
};

/**
 * Renders a single goal item with its details, including status and amount.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.goal - The goal object to display. Required.
 * @param {string} props.goal.description - The description of the goal. Required.
 * @param {number} props.goal.amount - The monetary amount associated with the goal. Required.
 * @param {string} props.goal.completed - The completion status of the goal. Must be one of "in-progress", "completed", or "failure". Required.
 * @remarks This component uses dynamic styles and icons based on the goal's completion status.
 * @returns {JSX.Element} A styled goal item with its description, status, and amount.
 * @example
 * const goal = {
 *   description: "Save for a car",
 *   amount: 5000,
 *   completed: "in-progress",
 * };
 *
 * <GoalListItem goal={goal} />
 */
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

/**
 * Component that renders a list of goals with their details.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.goals - An array of goal objects to display. Each goal should have an `id`, `description`, `amount`, and `completed` status. Required.
 * @returns {JSX.Element} A styled list of goals or a message if no goals are available.
 * @example
 * const goals = [
 *   { id: 1, description: "Save for a car", amount: 5000, completed: "in-progress" },
 *   { id: 2, description: "Emergency fund", amount: 10000, completed: "completed" },
 * ];
 *
 * <GoalList goals={goals} />
 */
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
