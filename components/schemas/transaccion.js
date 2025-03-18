const { z } = require("zod");

/**
 * Schema definition for a transaction object using Zod.
 * This schema validates the structure and constraints of a transaction.
 *
 * @constant
 * @type {import("zod").ZodObject}
 * @property {string} description - A required description of the transaction. Must be at least 1 character long.
 * @property {number} amount - A required positive number representing the transaction amount.
 * @property {"income"|"expense"} type - The type of transaction, either "income" or "expense". Defaults to "expense".
 * @property {"food"|"shopping"|"housing"|"transport"|"vehicles"|"entertainment"|"communications"|"investments"|"work"|"other"} category - The category of the transaction. Defaults to "other".
 * @property {boolean} [essential] - An optional boolean indicating if the transaction is essential.
 * @property {string} date - A required string representing the date of the transaction.
 */
export const transaccionSchema = z.object({
  description: z.string().min(1, { message: "La descripción es requerida." }),
  amount: z.coerce
    .number()
    .positive({ message: "El monto debe ser positivo." }),
  type: z.enum(["income", "expense"]).default("expense"),
  category: z
    .enum([
      "food",
      "shopping",
      "housing",
      "transport",
      "vehicles",
      "entertainment",
      "communications",
      "investments",
      "work",
      "other",
    ])
    .default("other"),
  essential: z.boolean().optional(),
  date: z.coerce.string(),
});

/**
 * Default transaction object structure.
 *
 * @typedef {Object} Transaccion
 * @property {string} description - A brief description of the transaction.
 * @property {number} amount - The monetary value of the transaction.
 * @property {string} type - The type of transaction, either "expense" or "income".
 * @property {string} category - The category of the transaction (e.g., "food", "transport", "other").
 * @property {boolean} essential - Indicates whether the transaction is essential or not.
 * @property {string} date - The date of the transaction in ISO 8601 format.
 */
export const defaultTransaccion = {
  description: "",
  amount: 0,
  type: "expense",
  category: "other",
  essential: false,
  date: new Date().toISOString().split("T")[0],
};
