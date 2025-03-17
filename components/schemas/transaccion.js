const { z } = require("zod");

export const transaccionSchema = z.object({
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  essential: z.boolean(),
  date: z.string(),
});

export const defaultTransaccion = {
  description: "",
  amount: 0,
  category: "",
  essential: false,
  date: "",
};
