import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  TRANSACTION_FORMAT_EXPLANATION,
  formatTransactionsForAI,
} from "./formatTransactionsForAI";
import {
  AI_ROLE_NAME,
  USER_ROLE_NAME,
  formatChatForAI,
  getLastMessagesByRole,
} from "./formatChatForAI";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const GEMINI_ROL = `
Eres un Asistente Financiero para usuarios de Fintrack, una aplicación de control y análisis financiero. Conoces los ingresos, gastos, presupuesto mensual y meta de ahorro mensual del usuario para instruirlo financieramente.

## Formato de respuesta
* Usa Markdown, párrafos fluidos con oraciones extensas y negrilla para resaltar lo clave.
* No hagas cálculos matemáticos. Explica estratégicamente.

## Restricciones y estilo
* Evita criticar al usuario. No intentes optimizar gastos esenciales salvo que superen la mitad de los ingresos. 
* Eres la guía del usuario, no sugieras al usuario buscar alternativas, ofrece tú las alternativas. No sugieras al usuario buscar que hacer, arma un plan para él.
* No seas genérico, menciona todos los datos posibles de las transacciones para que el usuario se identifique.
* Si tienes información sobre la meta ahorro y el presupuesto, incluyelas en la respuesta.
* Construye una narrativa a partir de los registros para hacer recomendaciones más útiles.
* Corrige errores de categorización si el usuario ha marcado mal un gasto esencial/no esencial.
* Ayuda al usuario a reflexionar sobre la moralidad de sus decisiones financieras.
* Habla un poco como las personas de Cali en Colombia pero profesional y amigable, no llames al usuario "parce", "socio" ni similares. Sé accesible, pero sin excesiva informalidad. Evita las oraciones de exclamación.
* Evita usar oraciones exclamativas.
* Si el usuario solo está saludando o despidiendose responde al saludo amigablemente.
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
export async function generateFinancialSummary(
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

  const formattedTransactions = formatTransactionsForAI(transacciones);

  try {
    const result = await model.startChat({ generationConfig, history: [] })
      .sendMessage(`
      Ubicación: Colombia
      Moneda: COP
      Meta de ahorro mensual: $${meta_ahorro_mensual}
      Presupuesto mensual: $${presupuesto_mensual}

      Este es el formato de las transacciones:
      ${TRANSACTION_FORMAT_EXPLANATION}

      Transacciones a analizar:
      ${formattedTransactions}

      Tu objetivo es analizar ingresos, gastos, presupuestos y ahorro para identificar patrones, oportunidades de mejora y riesgos financieros.

      Escribe un resumen financiero en máximo **dos párrafos**:
      1. Menciona lo más relevante que detectas (patrones, riesgos u oportunidades).
      2. Ofrece una o dos recomendaciones prácticas.

      No incluyas saludo ni cierre. No expliques el formato, ve directo al análisis. Usa markdown solo si es necesario.

      ## Formato de respuesta:
        * Estructura:
          - Saludo amigable (ej. Hola).
          - Resumen cronológico narrativo de transacciones relevantes (máx. 2 párrafos).
          - Sugerencias detalladas (máx. 2 párrafos).
          - Cierre breve de oración corta sobre Fintrack.

      ## Ejemplo de respuesta esperada
      "Hola, aquí Fintrack con tu análisis. Veo que en los últimos meses tus gastos en entretenimiento han crecido bastante. Si bien es bueno darse gustos, podrías establecer un límite mensual y redirigir parte de ese dinero a un fondo de inversión a corto plazo. Además, dado que tus ingresos son estables, automatizar un porcentaje fijo de ahorro puede ayudarte a evitar gastos impulsivos. Fintrack está aquí para que logres tus metas financieras, ¡Entre más metas, mejor!
    `);
    return result.response.text();
  } catch {
    return "Hubo un error al procesar la solicitud de IA.";
  }
}

/**
 * Continues an AI-driven financial conversation using chat history and contextual data.
 *
 * @async
 * @function continueFinancialChat
 * @param {Array<Object>} chatHistory - List of previous messages in the chat. Each message should include `sender` ("user" or "model") and `text`.
 * @param {Array<Object>} transacciones - Current financial transactions. These provide context if needed.
 * @param {number|null} [meta_ahorro_mensual=null] - Monthly savings goal based on income vs. expenses. Optional.
 * @param {number|null} [presupuesto_mensual=null] - Monthly budget cap, regardless of income. Optional.
 * @returns {Promise<string>} A promise resolving to the AI-generated chat response.
 * @throws {Error} If the AI request fails.
 *
 * @example
 * const history = [
 *   { sender: "user", text: "¿Cómo voy con mi ahorro?" },
 *   { sender: "model", text: "Vas bien, has ahorrado el 30% este mes." }
 * ];
 * const response = await continueFinancialChat(history, transacciones, 400000, 1200000);
 * console.log(response);
 */
export async function continueFinancialChat(
  chatHistory,
  transacciones,
  meta_ahorro_mensual = null,
  presupuesto_mensual = null,
) {
  const formattedTransactions = formatTransactionsForAI(transacciones);
  try {
    console.log("Iniciando solicitud de IA...");

    const chatSession = model.startChat({
      generationConfig,
      history: formatChatForAI(chatHistory),
    });

    const lastBotMessages = getLastMessagesByRole(chatHistory, AI_ROLE_NAME, 5);
    const lastUserMessages = getLastMessagesByRole(
      chatHistory,
      USER_ROLE_NAME,
      5,
    );

    const result = await chatSession.sendMessage(`   
        Este es el formato de las transacciones:
        ${TRANSACTION_FORMAT_EXPLANATION}

        Transacciones del usuario:
        ${formattedTransactions}

        Presupuesto mensual del usuario:
        "${presupuesto_mensual}"

        Meta de ahorro mensual:
        "${meta_ahorro_mensual}"

        Últimos mensajes del asistente:
        ${lastBotMessages.map((msg, i) => `(${i + 1}) ${msg}`).join("\n")}

        Últimos mensajes del usuario:
        ${lastUserMessages.map((msg, i) => `(${i + 1}) ${msg}`).join("\n")}

        Como Asistente Financiero para usuarios de Fintrack debes responder la última consulta del usuario. NO HAGAS ANALISIS, NO OFREZCAS HACER ANALISIS. No preguntes si debe hacerse algo, no intuyas que el usuario quiere que hagas algo, si el usuario te lo pide hazlo o explica por qué no se puede. 

        Responde como una persona normal, con tono breve y amigable SIN EXCLAMACIONES. Tu respuesta debe ser de máximo una oración. No te extiendas más incluso si el usuario te lo pide. 
        Solo si es necesario, deja claro que tus sugerencias son sugerencias pero NO tienen efecto en la aplicación porque no puedes usar la aplicación por el usuario. 
        Solo si es necesario, deja claro que solo tienes acceso a las transacciones del usuario con el filtro que tiene actualmente en el apartado de "Gestion de transacciones", pero que no conoces el filtro, el sistema no te da detalle de los filtros, solo los registros de las transacciones.
    `);

    return result.response.text();
  } catch (error) {
    console.error("Error en la solicitud a Gemini:", error);
    return "Disculpa, hubo un error técnico. ¿Puedes repetir?";
  }
}
