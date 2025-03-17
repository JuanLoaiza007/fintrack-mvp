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

export default function TransactionForm() {
  const form = useForm({
    resolver: zodResolver(transaccionSchema),
    defaultValues: defaultTransaccion,
  });

  const categories = [
    { value: "food", label: "Food" },
    { value: "rent", label: "Rent" },
    { value: "transport", label: "Transport" },
    { value: "utilities", label: "Utilities" },
    { value: "entertainment", label: "Entertainment" },
    { value: "other", label: "Other" },
  ];

  return (
    <div>
      <Form {...form}>
        <form className="flex flex-col py-4 gap-4">
          <div className="flex flex-col gap-4">
            <TextInput
              name="description"
              label="Description"
              placeholder="Description"
            />
            <NumberInput name="amount" label="Amount" placeholder="Amount" />
            <SelectInput
              name="category"
              label="Category"
              placeholder="Category"
              items={categories}
            />
            <BooleanInput name="essential" label="Escencial" />
            <DateInput name="date" label="Fecha" />
          </div>
          <div className="flex justify-center">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
