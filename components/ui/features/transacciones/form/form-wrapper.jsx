import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transaccionSchema } from "@/components/schemas/transaccion";
import { useEffect } from "react";
import TransactionForm from "../form";

/**
 * A wrapper component for managing the transaction form state and behavior.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {Object} props.transaction - The transaction data to populate the form. Required.
 * @remarks This component uses the `react-hook-form` library for form state management and validation,
 * and resets the form whenever the `transaction` prop changes.
 * @returns {JSX.Element} The rendered transaction form wrapped with state management.
 * @example
 * // Example usage:
 * import FormWrapper from './form-wrapper';
 *
 * const transaction = {
 *   id: 1,
 *   amount: 100,
 *   description: "Groceries",
 * };
 *
 * <FormWrapper transaction={transaction} />;
 */
export default function FormWrapper({ transaction }) {
  const form = useForm({
    resolver: zodResolver(transaccionSchema),
    defaultValues: transaction,
  });

  useEffect(() => {
    form.reset(transaction);
  }, [transaction]);

  return (
    <TransactionForm
      isSaveAvailable={false}
      transaction={transaction}
      setIsCreateOpen={() => {}}
    />
  );
}
