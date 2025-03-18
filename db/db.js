import { transaccionSchema } from "@/components/schemas/transaccion";

/**
 * Opens an IndexedDB database named "FinanzasDB" and ensures the necessary object stores are created.
 * 
 * This function handles the creation of the "transactions" object store if it does not already exist.
 * It resolves with the opened database instance or rejects with an error if the database cannot be opened.
 * 
 * @returns {Promise<IDBDatabase>} A promise that resolves to the opened IndexedDB database instance.
 * @throws {DOMException} If there is an error opening the IndexedDB database.
 */
export async function openDB() {
  return new Promise((resolve, reject) => {
    console.log("🔹 Abriendo IndexedDB...");
    const request = indexedDB.open("FinanzasDB", 1);

    request.onupgradeneeded = (event) => {
      console.log("🛠️ Verificando y creando almacenes...");
      const db = event.target.result;

      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
        console.log("✅ Almacén de transacciones creado.");
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log("✅ IndexedDB abierta con éxito.");
      resolve(db);
    };

    request.onerror = () => {
      console.error("❌ Error al abrir IndexedDB:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Adds a transaction to the database after validating it against the schema.
 *
 * @async
 * @function
 * @param {Object} transaction - The transaction object to be added.
 * @returns {Promise<boolean>} Resolves to `true` if the transaction is successfully added, 
 * or rejects with an error if validation or database operation fails.
 * @throws {Array} Throws an array of validation errors if the transaction fails schema validation.
 */
export async function addTransaction(transaction) {
  try {
    const validatedTransaction = transaccionSchema.parse(transaction);
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.add({ id: Date.now(), ...validatedTransaction });

      request.onsuccess = () => {
        console.log("✅ Transacción agregada:", validatedTransaction);
        resolve(true);
      };

      request.onerror = () => {
        console.error("❌ Error al agregar transacción:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("❌ Error de validación:", error.errors);
    return Promise.reject(error.errors);
  }
}
