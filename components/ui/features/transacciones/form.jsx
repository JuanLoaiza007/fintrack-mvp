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
