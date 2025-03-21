import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import { goalSchema, defaultGoal } from "@/components/schemas/goal";
import TextInput from "@/components/ui/features/text-input";
import NumberInput from "../number-input";
import { Button } from "../../button";
import { useEffect } from "react";

/**
 * A form component for creating or editing a financial goal.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Function} props.setIsCreateOpen - A function to toggle the creation modal. Required.
 * @param {Object|null} [props.goal=null] - The goal data to prefill the form. Optional, defaults to null.
 * @param {Function} props.onSubmit - A callback function to handle form submission. Required.
 * @remarks This component uses `react-hook-form` for form handling and validation, and resets the form whenever the `goal` prop changes.
 * @returns {JSX.Element} A form for creating or editing a financial goal.
 * @example
 * <GoalForm
 *   setIsCreateOpen={setIsCreateOpen}
 *   goal={{ amount: 500, description: "Vacation savings" }}
 *   onSubmit={(data) => console.log(data)}
 * />
 */
export default function GoalForm({ setIsCreateOpen, goal = null, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: goal || defaultGoal,
  });

  /**
   * Handles the form submission by invoking the provided onSubmit callback
   * with the form data and closing the creation modal.
   *
   * @async
   * @function handleSubmit
   * @param {Object} data - The data submitted from the form (required).
   * @returns {Promise<void>} A promise that resolves when the submission is complete.
   * @example
   * handleSubmit({ amount: 100, description: "Savings goal" })
   *   .then(() => console.log("Form submitted successfully"))
   *   .catch((error) => console.error("Error submitting form", error));
   */
  const handleSubmit = async (data) => {
    onSubmit(data);
    setIsCreateOpen(false);
  };

  // Reset the form when the goal prop changes
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
