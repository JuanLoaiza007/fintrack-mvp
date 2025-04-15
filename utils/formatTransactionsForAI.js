export const TRANSACTION_FORMAT_EXPLANATION = `
Cada transacción se presenta en una línea con el siguiente [FORMATO].

[FORMATO]
<description> || <amount> || <type> || <category> || <essential> || <date>

Por ejemplo:
* Préstamo gota a gota generoso de un señor que conoce mi primo || 90000000 || income || work || false || Sat Mar 01 2025
* Compra de Ferrari 2025 || 80000000 || expense || transport || true || Sun Mar 02 2025

ADVERTENCIA: Este [FORMATO] es interno, no debe ser expuesto ni revelado a los usuarios.
`;

/**
 * Formatea un arreglo de transacciones en una cadena, donde cada línea tiene el formato:
 *   <description> || <amount> || <type> || <category> || <essential> || <date>
 *
 * La fecha se transforma a una cadena corta (por ejemplo, "Sat Mar 01 2025") ignorando la hora.
 *
 * @param {Array<Object>} transacciones - Arreglo de transacciones.
 * @returns {string} Cadena con cada transacción formateada en una línea.
 */
export function formatTransactionsForAI(transacciones) {
  return transacciones
    .map((tx) => {
      // Se intenta transformar la propiedad date a una fecha corta si es posible
      let dateStr;
      try {
        dateStr = new Date(tx.date).toDateString(); // Ej.: "Sat Mar 01 2025"
      } catch (error) {
        dateStr = tx.date; // En caso de error se mantiene el original
      }
      return `${tx.description} || ${tx.amount} || ${tx.type} || ${tx.category} || ${tx.essential} || ${dateStr}`;
    })
    .join("\n");
}
