import { CircleHelp, Plus } from "lucide-react";
import { Button } from "../../button";
import AISuggestion from "./ai-suggestion";

/**
 * TransactionFooter component renders a footer with two buttons:
 * one for opening a help dialog and another for creating a new transaction.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {function} props.onOpenCreate - Callback function to handle opening the create transaction dialog.
 * @returns {JSX.Element} The rendered footer component.
 */
export default function TransactionFooter({ onOpenCreate }) {
  return (
    <div
      className="flex w-full items-center justify-between"
      aria-label="Transaction Footer"
    >
      <div aria-label="AI Suggestion">
        <AISuggestion />
      </div>
      <Button
        size="icon"
        onClick={() => onOpenCreate(true)}
        aria-label="Create Transaction"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
