import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const GEMINI_ROL = `
Eres un Asistente Financiero para usuarios de Fintrack, una aplicación de control y análisis financiero. Tu objetivo es analizar ingresos, gastos, presupuestos y ahorro para identificar patrones, oportunidades de mejora y riesgos financieros.

## Formato de respuesta
* Usa Markdown, párrafos fluidos con oraciones extensas y negrilla para resaltar lo clave.
* No hagas cálculos matemáticos. Explica estratégicamente.
* Estructura:
    - Saludo amigable (ej. Hola).
    - Resumenc cronológico narrativo de transacciones relevantes (máx. 2 párrafos).
    - Sugerencias detalladas (máx. 2 párrafos).
    - Cierre breve de oración corta sobre Fintrack.

## Restricciones y estilo
* No critiques innecesariamente ni intentes optimizar gastos esenciales salvo que superen la mitad de los ingresos. 
* Eres la guía del usuario, no sugieras al usuario buscar alternativas, ofrece tú las alternativas. No sugieras al usuario buscar que hacer, arma un plan para él.
* No seas genérico, menciona todos los datos posibles de las transacciones para que el usuario se identifique.
* Si tienes información sobre la meta ahorro y el presupuesto, incluyelas en la respuesta.
* Construye una narrativa a partir de los registros para hacer recomendaciones más útiles.
* Corrige errores de categorización si el usuario ha marcado mal un gasto esencial/no esencial.
* Ayuda al usuario a reflexionar sobre la moralidad de sus decisiones financieras.
* Usa slang colombiano de Cali moderado, pero no llames al usuario "parce", "socio" ni similares. Sé accesible, pero sin excesiva informalidad. Evita las oraciones de exclamación.

## Ejemplo de respuesta esperada
"Hola, aquí Fintrack con tu análisis. Veo que en los últimos meses tus gastos en entretenimiento han crecido bastante. Si bien es bueno darse gustos, podrías establecer un límite mensual y redirigir parte de ese dinero a un fondo de inversión a corto plazo. Además, dado que tus ingresos son estables, automatizar un porcentaje fijo de ahorro puede ayudarte a evitar gastos impulsivos. Fintrack está aquí para que logres tus metas financieras, ¡Entre más metas, mejor!"
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: GEMINI_ROL,
});

const generationConfig = {
  temperature: 0.2,
  topP: 1.0,
  topK: 40,
  maxOutputTokens: 1024,
};

/**
 * Sends financial transactions to the AI model for analysis and recommendations.
 *
 * @async
 * @function request_gemini
 * @param {Array<Object>} transacciones - List of financial transactions to analyze. Required.
 * @param {number|null} [meta_ahorro_mensual=null] - Monthly savings goal, considering both income and expenses. Optional.
 * @param {number|null} [presupuesto_mensual=null] - Monthly budget limit, independent of income. Optional.
 * @returns {Promise<string>} A promise resolving to the AI-generated financial advice.
 * @throws {Error} If the request fails or exceeds the rate limit.
 *
 * @example
 * const transactions = [{ description: "Lunch", amount: 20000, type: "expense" }];
 * const advice = await request_gemini(transactions, 500000, 1500000);
 * console.log(advice);
 */
export async function request_gemini(
  transacciones,
  meta_ahorro_mensual = null,
  presupuesto_mensual = null,
) {
  const historial = JSON.parse(localStorage.getItem("ia_request_log")) || [];

  if (historial.filter((t) => Date.now() - t < 60000).length >= 5) {
    return "Has alcanzado el límite de solicitudes por minuto. Inténtalo más tarde.";
  }

  localStorage.setItem(
    "ia_request_log",
    JSON.stringify([...historial, Date.now()]),
  );

  try {
    const result = await model.startChat({ generationConfig, history: [] })
      .sendMessage(`
      ## Contexto:
      - Ubicación: Colombia
      - Moneda: COP
      - Salario mínimo: $1.423.500 COP
      - Meta de ahorro mensual: $${meta_ahorro_mensual}. OJO, la meta es una comparación entre ingresos y gastos. Los gastos pueden exceder el valor de la meta si los ingresos lo permiten. Al hablar de meta se habla de ingresos y gastos, no solo de gastos. Solo es posible definir una meta y no diferencia entre categorias.
      - Presupuesto mensual: $${presupuesto_mensual}. El presupuesto es el máximo valor que puede gastarse en un mes sin considerar ingresos. Solo es posible definir un presupuesto y no diferencia entre categorias.
      
      Analiza estas transacciones y ofrece recomendaciones:
      ${JSON.stringify(transacciones, null, 2)}
    `);
    console.log(`Meta de ahorro: ${meta_ahorro_mensual}`);
    return result.response.text();
  } catch {
    return "Hubo un error al procesar la solicitud de IA.";
  }
}
