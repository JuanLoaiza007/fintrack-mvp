import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import {
  transaccionSchema,
  defaultTransaccion,
} from "@/components/schemas/transaccion";
import TextInput from "@/components/ui/features/text-input";
import NumberInput from "../number-input";
import SelectInput from "../select-input";
import BooleanInput from "../boolean-input";
import DateInput from "../date-input";
import { Button } from "../../button";
import { addTransaction } from "@/db/db";

/**
 * TransactionForm Component
 *
 * @description
 * A form component for creating or editing a transaction. It includes fields for
 * description, amount, type, category, date, and an optional "essential" field
 * for expense transactions. The form uses `react-hook-form` for state management
 * and validation.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered transaction form component.
 *
 * @example
 * <TransactionForm />
 *
 * @dependencies
 * - `useForm` from `react-hook-form` for form state management.
 * - `zodResolver` for schema validation.
 * - Custom input components: `TextInput`, `NumberInput`, `SelectInput`, `DateInput`, `BooleanInput`.
 * - `addTransaction` function for handling transaction submission.
 *
 * @remarks
 * - The `essential` field is conditionally rendered based on the selected transaction type.
 * - The form handles submission by creating a payload and passing it to the `addTransaction` function.
 */
export default function TransactionForm() {
  const form = useForm({
    resolver: zodResolver(transaccionSchema),
    defaultValues: defaultTransaccion,
  });

  const categories = [
    { value: "food", label: "Comida y Bebida" },
    { value: "shopping", label: "Compras" },
    { value: "housing", label: "Vivienda" },
    { value: "transport", label: "Transporte" },
    { value: "vehicles", label: "Vehículos" },
    { value: "entertainment", label: "Vida y Entretenimiento" },
    { value: "communications", label: "Comunicaciones, PC" },
    { value: "investments", label: "Inversiones" },
    { value: "work", label: "Trabajo" },
    { value: "other", label: "Otros" },
  ];

  const types = [
    { value: "income", label: "Ingreso" },
    { value: "expense", label: "Gasto" },
  ];

  /**
   * Handles the submission of transaction data.
   *
   * @param {Object} data - The transaction data submitted from the form.
   * @param {string} data.type - The type of transaction, either "income" or "expense".
   * @param {boolean} [data.essential] - Indicates if the transaction is essential (only applicable for "expense" type).
   *
   * @description
   * Creates a payload object from the submitted data. If the transaction type is "income",
   * the `essential` property is removed from the payload. The resulting payload is then
   * passed to the `addTransaction` function to process the transaction.
   */
  const handleSubmit = (data) => {
    const payload = { ...data };
    if (payload.type === "income") {
      delete payload.essential;
    }

    addTransaction(payload);
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="flex flex-col py-4 gap-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex flex-col gap-4">
            <TextInput
              name="description"
              label="Description"
              placeholder="Description"
            />
            <NumberInput name="amount" label="Amount" placeholder="Amount" />
            <SelectInput
              name="type"
              label="Tipo"
              placeholder="Tipo"
              items={types}
            />
            <SelectInput
              name="category"
              label="Category"
              placeholder="Category"
              items={categories}
            />
            <DateInput name="date" label="Fecha" />
            {form.watch("type") === "expense" && (
              <BooleanInput name="essential" label="Esencial" />
            )}
          </div>
          <div className="flex justify-center">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
