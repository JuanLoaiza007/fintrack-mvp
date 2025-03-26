"use client";
import React, { useEffect } from "react";
import NumberInput from "../number-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { budgetSchema, defaultBudget } from "@/components/schemas/budget";

/**
 * A form component for creating or editing a budget entry.
 *
 * This component provides a form for users to enter budget details, including amount and description.
 * It uses `react-hook-form` for form state management and `zodResolver` for validation.
 * The form resets whenever the `budget` prop changes.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Function} props.setIsCreateOpen - Function to toggle the budget creation modal. Required.
 * @param {Object|null} [props.budget=null] - The budget data to prefill the form. Optional.
 * @param {number} props.budget.amount - The amount allocated for the budget.
 * @param {string} props.budget.description - The description of the budget.
 * @param {Function} props.onSubmit - Function to handle form submission. Required.
 *
 * @returns {JSX.Element} A form with inputs for amount and description, and a submit button.
 *
 * @example
 * <BudgetForm
 *   setIsCreateOpen={setIsCreateOpen}
 *   budget={{ amount: 1000, description: "Monthly Budget" }}
 *   onSubmit={(data) => console.log(data)}
 * />
 */
export default function BudgetForm({
  setIsCreateOpen,
  budget = null,
  onSubmit,
}) {
  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || defaultBudget,
  });

  /**
   * Handles the submission of the budget form.
   *
   * This function processes the form submission by invoking the `onSubmit` callback
   * and then closing the budget creation modal.
   *
   * @async
   * @function handleSubmit
   * @param {Object} data - The form data containing budget details.
   * @param {number} data.amount - The budget amount.
   * @param {string} data.description - The budget description.
   * @returns {Promise<void>} A promise that resolves when the form submission is completed.
   * @throws {Error} Throws an error if the submission process fails.
   *
   * @example
   * handleSubmit({ amount: 500, description: "Groceries" })
   *   .then(() => console.log("Budget submitted successfully"))
   *   .catch((error) => console.error("Submission failed", error));
   */
  const handleSubmit = async (data) => {
    onSubmit(data);
    setIsCreateOpen(false);
  };

  // Reset the form when the budget prop changes
  useEffect(() => {
    form.reset(budget || defaultBudget);
  }, [budget, form]);
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
          </div>
          <div className="flex justify-center">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
