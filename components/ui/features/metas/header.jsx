import { Plus, Trash2, Edit, List } from "lucide-react";
import { Button } from "../../button";

/**
 * Renders a header with buttons for managing monthly goals.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {function} props.onOpenCreate - Callback to open the goal creation modal. Required.
 * @param {function} props.onDelete - Callback to delete the current goal. Required.
 * @param {function} props.onListOpen - Callback to open the goal list modal. Required.
 * @param {boolean} props.goal - Indicates if a goal is already defined. Optional.
 * @remarks This component uses the `Button` component and icons from `lucide-react`.
 * @returns {JSX.Element} A header with buttons for creating, editing, deleting, and listing goals.
 * @example
 * <GoalHeader
 *   onOpenCreate={(isOpen) => console.log("Open Create:", isOpen)}
 *   onDelete={() => console.log("Delete goal")}
 *   onListOpen={(isOpen) => console.log("Open List:", isOpen)}
 *   goal={true}
 * />
 */
export default function GoalHeader({
  onOpenCreate,
  onDelete,
  onListOpen,
  goal,
}) {
  return (
    <div className="flex w-full items-center justify-center gap-4">
      <Button onClick={() => onOpenCreate(true)} disabled={goal}>
        <Plus className="w-6 h-6" />
        Define tu meta mensual
      </Button>
      <Button
        size="icon"
        onClick={() => onOpenCreate(true)}
        className="bg-yellow-400 text-white hover:bg-yellow-500"
      >
        <Edit className="w-6 h-6" />
      </Button>
      <Button size="icon" variant="destructive" onClick={onDelete}>
        <Trash2 className="w-6 h-6" />
      </Button>
      <Button size="icon" variant="outline" onClick={() => onListOpen(true)}>
        <List className="w-6 h-6" />
      </Button>
    </div>
  );
}
