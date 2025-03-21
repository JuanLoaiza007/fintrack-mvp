import { z } from "zod";

/**
 * Represents the default structure of a goal object.
 * @typedef {Object} Goal
 * @property {number} id - The unique identifier for the goal.
 * @property {number} amount - The target amount for the goal.
 * @property {string} description - A brief description of the goal.
 * @property {string} targetDate - The ISO string representation of the target date for the goal.
 * @property {string} createdAt - The ISO string representation of the creation date of the goal.
 * @property {string} updatedAt - The ISO string representation of the last update date of the goal.
 * @property {string} completed - The status of the goal, defaulting to "in-progress".
 */
export const defaultGoal = {
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
 * Schema definition for a goal object using Zod.
 * This schema validates the structure of a goal object.
 *
 * @typedef {Object} GoalSchema
 * @property {number} [id] - The unique identifier for the goal (optional).
 * @property {number} amount - The target amount for the goal. Must be a positive number.
 * @property {string} description - A description of the goal.
 * @property {string} targetDate - The target date for achieving the goal, represented as a string.
 * @property {string} createdAt - The creation date of the goal, represented as a string.
 * @property {string} updatedAt - The last updated date of the goal, represented as a string.
 * @property {"in-progress" | "completed" | "failure"} [completed="in-progress"] -
 *     The status of the goal. Defaults to "in-progress" if not provided.
 *     Possible values are:
 *       - "in-progress": The goal is currently being worked on.
 *       - "completed": The goal has been achieved.
 *       - "failure": The goal was not achieved.
 */
export const goalSchema = z.object({
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
