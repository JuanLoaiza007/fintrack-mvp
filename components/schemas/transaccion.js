const { z } = require("zod");

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
  date: z.coerce.string().min(1, { message: "La fecha es requerida." }),
});

export const defaultTransaccion = {
  description: "",
  amount: 0,
  type: "expense",
  category: "other",
  essential: false,
  date: "",
};
