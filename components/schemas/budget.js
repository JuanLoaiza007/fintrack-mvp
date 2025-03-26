import { z } from "zod";

/**
 * Represents the default structure of a budget object.
 * @typedef {Object} Budget
 * @property {number} id - The unique identifier for the budget.
 * @property {number} amount - The allocated amount for the budget.
 * @property {string} description - A brief description of the budget.
 * @property {string} targetDate - The ISO string representation of the target date for the budget.
 * @property {string} createdAt - The ISO string representation of the creation date of the budget.
 * @property {string} updatedAt - The ISO string representation of the last update date of the budget.
 * @property {string} completed - The status of the budget, defaulting to "in-progress".
 */
export const defaultBudget = {
  id: 0,
  amount: 0,
  description: "",
  targetDate: new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completed: "in-progress",
};

/**
 * Schema definition for a budget object using Zod.
 * This schema validates the structure of a budget object.
 *
 * @typedef {Object} BudgetSchema
 * @property {number} [id] - The unique identifier for the budget (optional).
 * @property {number} amount - The allocated amount for the budget. Must be a positive number.
 * @property {string} description - A description of the budget.
 * @property {string} targetDate - The target date for the budget, represented as a string.
 * @property {string} createdAt - The creation date of the budget, represented as a string.
 * @property {string} updatedAt - The last updated date of the budget, represented as a string.
 * @property {"in-progress" | "completed" | "failure"} [completed="in-progress"] -
 *     The status of the budget. Defaults to "in-progress" if not provided.
 *     Possible values are:
 *       - "in-progress": The budget is currently active.
 *       - "completed": The budget has been fully utilized.
 *       - "failure": The budget was not successfully managed.
 */
export const budgetSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().positive(),
  description: z.string(),
  targetDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completed: z
    .enum(["in-progress", "completed", "failure"])
    .default("in-progress")
    .optional(),
});
