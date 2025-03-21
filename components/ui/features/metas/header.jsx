import { Plus, Trash2, Edit, List } from "lucide-react";
import { Button } from "../../button";

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
