import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import { goalSchema, defaultGoal } from "@/components/schemas/goal";
import TextInput from "@/components/ui/features/text-input";
import NumberInput from "../number-input";
import { Button } from "../../button";
import { useEffect } from "react";

export default function GoalForm({ setIsCreateOpen, goal = null, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: goal || defaultGoal,
  });

  const handleSubmit = async (data) => {
    onSubmit(data);
    setIsCreateOpen(false);
  };

  useEffect(() => {
    form.reset(goal || defaultGoal);
  }, [goal]);

  return (
    <div>
      <Form {...form}>
        <form
          data-testid="transaction-form"
          className="flex flex-col py-4 gap-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex flex-col gap-4">
            <NumberInput name="amount" label="Amount" placeholder="Amount" />
            <TextInput
              name="description"
              label="Description"
              placeholder="Description"
            />
          </div>
          <div className="flex justify-center">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
