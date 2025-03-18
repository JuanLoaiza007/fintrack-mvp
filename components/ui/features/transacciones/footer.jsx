import { CircleHelp, Plus } from "lucide-react";
import { Button } from "../../button";

/**
 * TransactionFooter component renders a footer with two buttons:
 * one for opening a help dialog and another for creating a new transaction.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {function} props.onOpenHelp - Callback function to handle opening the help dialog.
 * @param {function} props.onOpenCreate - Callback function to handle opening the create transaction dialog.
 * @returns {JSX.Element} The rendered footer component.
 */
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
