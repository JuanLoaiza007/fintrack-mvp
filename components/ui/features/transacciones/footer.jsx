import { CircleHelp, Plus } from "lucide-react";
import { Button } from "../../button";

export default function TransactionFooter({ onOpenHelp, onOpenCreate }) {
  return (
    <div className="flex  w-full items-center justify-between">
      <Button size="icon" onClick={() => onOpenHelp(true)}>
        <CircleHelp className="w-6 h-6" />
      </Button>
      <Button size="icon" onClick={() => onOpenCreate(true)}>
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
