import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transaccionSchema } from "@/components/schemas/transaccion";
import { useEffect } from "react";
import TransactionForm from "../form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

/**
 * A wrapper component for managing a transaction form with update and delete functionality.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {Object} props.transaction - The transaction data to populate the form. Required.
 * @param {number} props.index - The index of the transaction in the list. Required.
 * @param {Function} props.onUpdate - Callback function to handle updates to the transaction. Required.
 * @param {Function} props.onDelete - Callback function to handle deletion of the transaction. Required.
 * @remarks This component uses the `react-hook-form` library for form management and validation,
 * and subscribes to form changes using the `watch` method to trigger updates.
 * @returns {JSX.Element} A wrapper containing the transaction form and a delete button.
 * @example
 * ```jsx
 * import FormWrapper from "./form-wrapper";
 *
 * const handleUpdate = (index, data) => {
 *   console.log(`Updated transaction at index ${index}:`, data);
 * };
 *
 * const handleDelete = () => {
 *   console.log("Transaction deleted");
 * };
 *
 * <FormWrapper
 *   transaction={{ amount: 100, description: "Groceries" }}
 *   index={0}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 * />;
 * ```
 */
export default function FormWrapper({
  transaction,
  index,
  onUpdate,
  onDelete,
}) {
  const form = useForm({
    resolver: zodResolver(transaccionSchema),
    defaultValues: transaction,
  });

  useEffect(() => {
    const subscription = form.watch((data) => {
      onUpdate(index, data);
    });

    return () => subscription.unsubscribe();
  }, [form, index, onUpdate]);

  return (
    <div className="flex flex-col gap-2">
      <TransactionForm
        isSaveAvailable={false}
        transaction={transaction}
        setIsCreateOpen={() => {}}
        formInstance={form}
      />
      <Button variant="destructive" onClick={onDelete} className="self-center">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
