import { z } from "zod";

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
