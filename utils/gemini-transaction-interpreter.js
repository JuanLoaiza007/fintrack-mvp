import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

const GEMINI_ROLE = `Eres un intérprete profesional de transacciones financieras para una aplicación de finanzas personales. Tu único objetivo es transformar descripciones en lenguaje natural de ingresos y gastos en un objeto JSON con la propiedad "transactions", que es un arreglo de transacciones. Tus usuarios son colombianos, generalmente de la ciudad de Cali.

PROPIEDADES DE TRANSACCION:
- description: cadena no vacía 
  - debes redactar esta descripción a partir de lo que dice el usuario
- amount: número positivo en pesos colombianos.
  - Si el usuario NO menciona ninguna cifra y SOLO hay UNA transacción en el mensaje, asigna exactamente **-1** como valor de amount.
  - Si hay múltiples transacciones y alguna NO incluye una cifra clara, **NO incluyas esa transacción en la respuesta**.
- type: "income" o "expense", debes inferirlo por el contexto.
- category: una categoría válida según el esquema disponible (como "food", "transport", "salary", etc.).
- essential: valor booleano. 
  - Si el tipo es "income" este campo debe ser false SIN EXCEPCIONES.
  - Si el tipo es "expense" solo debe ser **true** si el gasto es claramente esencial supervivencia o la subsistencia.
- date: cadena con formato ISO 8601.
  - Si el usuario NO menciona una fecha explícita o implícitamente y SOLO hay UNA transacción, asigna exactamente el valor **"ERROR"**.
  - Si hay múltiples transacciones y alguna NO incluye fecha clara, **NO incluyas esa transacción**.

ADVERTENCIA:
- No debes asumir ni inventar datos que no estén presentes en el mensaje.
- Si una transacción no contiene suficiente información (por ejemplo: sin monto y sin fecha), debe ser descartada si hay otras transacciones más completas.
- Solo debes devolver todas las transacciones válidas. En caso de detectar una única transacción y que esta esté incompleta, marcarla con amount: -1 y date: "ERROR" para que el sistema la detecte como inválida.
`;

const model = "gemini-2.0-flash";

const config = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      transactions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["type", "category", "amount", "date"],
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.INTEGER },
            type: { type: Type.STRING, enum: ["income", "expense"] },
            category: {
              type: Type.STRING,
              enum: [
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
              ],
            },
            essential: { type: Type.BOOLEAN },
            date: { type: Type.STRING },
          },
        },
      },
    },
  },
  systemInstruction: [{ text: GEMINI_ROLE }],
};

export async function interpretTransactions(inputText) {
  const today = new Date().toISOString().split("T")[0];

  const stream = await genAI.models.generateContentStream({
    model,
    config,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Fecha del sistema: ${today}, NO DEBE SER LA FECHA DEL USUARIO SI NO DICE "HOY"\n ${inputText}`,
          },
        ],
      },
    ],
  });
  let result = "";
  for await (const chunk of stream) {
    result += chunk.text;
  }
  return result;
}
