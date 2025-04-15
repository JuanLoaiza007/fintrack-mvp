export const AI_ROLE_NAME = "model";
export const USER_ROLE_NAME = "user";

/**
 * Convierte el historial de chat al formato requerido por Gemini
 *
 * @param {Array<Object>} chatHistory - Historial de chat con `sender` y `text`.
 * @returns {Array<Object>} Historial formateado para Gemini.
 */
export function formatChatForAI(chatHistory) {
  return chatHistory.map((msg) => ({
    role: msg.sender === USER_ROLE_NAME ? USER_ROLE_NAME : AI_ROLE_NAME,
    parts: [{ text: msg.text }],
  }));
}

/**
 * Utility to extract the last N messages by role from chat history.
 *
 * @param {Array<Object>} chatHistory - Full chat history with `sender` and `text`.
 * @param {string} role - Role to filter by.
 * @param {number} count - Number of latest messages to retrieve.
 * @returns {string[]} Array of message texts, most recent last.
 */
export function getLastMessagesByRole(chatHistory, role, count) {
  if (role !== USER_ROLE_NAME && role !== AI_ROLE_NAME) {
    throw new Error("Invalid role name");
  }
  const result = chatHistory
    .filter((msg) => msg.sender === role)
    .slice(-count)
    .map((msg) => msg.text);

  return result;
}
