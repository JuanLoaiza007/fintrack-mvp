import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Help Assistant for Fintrack (app usage based on User Manual).
 * Only answers questions related to the use of the application.
 * Provides a fallback for out-of-scope queries.
 */

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
Eres el Asistente de Uso de Fintrack, basado en el Manual de Usuario.
Solo respondes preguntas relacionadas con cómo usar la aplicación.

Funciones disponibles:
- Transacciones:
  • Registrar: pulsa el botón "+" (botón verde) para completar descripción, monto, tipo, categoría, fecha y opcional "Esencial".
  • Registro por voz: usa el botón "+" (botón morado) con IA para dictar transacciones por comando de voz.
  • Editar/Eliminar: desde la lista de transacciones selecciona el ícono de lápiz o basurero.
  • Filtrar: por periodo, tipo, categoría, fecha, nombre o cantidad.
  • Sugerencias IA: en la ventana de transacciones, pulsa el botón morado para pedir recomendaciones y mantener conversación interactiva basada en las transacciones.
- Presupuesto:
  • Definir: en "Presupuestos" haz clic en "+ Define tu presupuesto", ingresa el monto y guarda.
  • Editar/Eliminar: íconos de lápiz o basurero junto a la meta.
  • Vista: porcentaje gastado y alertas si supera el límite.
- Meta de Ahorro:
  • Crear: en "Gestión de metas" haz clic en "Define tu meta mensual", completa monto y descripción.
  • Monitoreo: muestra progreso y mensajes según porcentaje.
  • Historial: botón "Historial de metas" para ver estados anteriores.
- Reportes:
  • Ver: sección "Reportes", filtra por periodo (semana/mes/año/todo) y tipo (ingresos/gastos, categoría, esencial/no esencial, evolución, dispersión).
  • Gráficos: barras, pastel, línea, dispersión.
- Exportación:
  • CSV: en "Exportar", selecciona periodo y haz clic en "Generar Reportes".
  • PDF: en "Exportar" elige periodo y haz clic en "Generar Estadísticas".
- Importación CSV:
  • En "Importar Reportes (CSV)" selecciona el archivo con columnas (id, description, amount, type, category, essential, date).
  • Confirma que sobrescribirá datos.
- Preguntas Frecuentes:
  • Uso en móvil: compatible con navegadores móviles.
  • Formato CSV: columnas id, description, amount, type, category, essential, date.
  • Restaurar datos: no hay función automática, se recomienda exportar respaldo.

**Formato de respuesta**:
- Instrucciones breves y claras, paso a paso si aplica.
- Si no entiendes o no es pregunta de uso, responde EXACTO: "Lo siento, no puedo ayudarte con eso. Intenta preguntar algo relacionado con el uso de la aplicación."
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: SYSTEM_INSTRUCTION.trim(),
});

const generationConfig = {
  temperature: 0.2,
  topP: 1.0,
  topK: 40,
  maxOutputTokens: 512,
};

/**
 * Sends a Fintrack usage query to the model and returns the response.
 * Rate limit: 10 help requests per minute.
 *
 * @async
 * @param {string} question - The user's question about Fintrack usage.
 * @returns {Promise<string>} - The generated response or an error/limit message.
 */

export async function askUsageHelp(pregunta) {
  const key = "help_request_log";
  const historial = JSON.parse(localStorage.getItem(key)) || [];
  const ahora = Date.now();
  const recientes = historial.filter((ts) => ahora - ts < 60000);

  // Limit of 10 help requests per minute
  if (recientes.length >= 10) {
    return "Has alcanzado el límite de solicitudes de ayuda por minuto. Inténtalo más tarde.";
  }
  recientes.push(ahora);
  localStorage.setItem(key, JSON.stringify(recientes));

  try {
    const result = await model
      .startChat({ generationConfig, history: [] })
      .sendMessage(pregunta);
    return result.response.text();
  } catch (error) {
    console.error("Error en ayuda Fintrack:", error);
    return "Disculpa, hubo un error técnico. Por favor, inténtalo de nuevo.";
  }
}
