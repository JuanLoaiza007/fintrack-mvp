export const AI_ROLE_NAME = "model";
export const USER_ROLE_NAME = "user";

/**
 * Converts the chat history into the format required by Gemini.
 *
 * @param {Array<Object>} chatHistory - Chat history where each message has `sender` and `text` properties.
 * @returns {Array<Object>} Chat formatted for Gemini's input structure.
 */
export function formatChatForAI(chatHistory) {
  return chatHistory.map((msg) => ({
    role: msg.sender === USER_ROLE_NAME ? USER_ROLE_NAME : AI_ROLE_NAME,
    parts: [{ text: msg.text }],
  }));
}

/**
 * Retrieves the last N messages from the chat history by a specific role.
 *
 * @param {Array<Object>} chatHistory - Full chat history where each message has `sender` and `text`.
 * @param {string} role - The role to filter messages by (`"user"` or `"model"`).
 * @param {number} count - The number of most recent messages to return.
 * @returns {string[]} An array of message texts, ordered from oldest to newest.
 * @throws {Error} If the provided role is invalid.
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
