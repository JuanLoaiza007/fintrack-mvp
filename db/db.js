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

/**
 * Retrieves all transactions from the IndexedDB database.
 *
 * @async
 * @function
 * @returns {Promise<Array>} Resolves to an array of transaction objects.
 * @throws {DOMException} If there is an error retrieving transactions.
 */
export async function getTransactions() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readonly");
      const store = tx.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = () => {
        console.log("📂 Transacciones obtenidas:", request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("❌ Error al obtener transacciones:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("❌ Error al acceder a la base de datos:", error);
    return Promise.reject(error);
  }
}

/**
 * Deletes a transaction from the database by its ID.
 *
 * @async
 * @function
 * @param {number} transactionId - The ID of the transaction to be deleted.
 * @returns {Promise<boolean>} Resolves to `true` if the transaction is successfully deleted,
 * or rejects with an error if the database operation fails.
 * @throws {Error} Throws an error if the transaction ID is invalid or the operation fails.
 */
export async function deleteTransaction(transactionId) {
  try {
    if (!transactionId || typeof transactionId !== "number") {
      throw new Error("El ID de la transacción debe ser un número válido.");
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.delete(transactionId);

      request.onsuccess = () => {
        console.log("✅ Transacción eliminada:", transactionId);
        resolve(true);
      };

      request.onerror = () => {
        console.error("❌ Error al eliminar transacción:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("❌ Error al eliminar transacción:", error);
    return Promise.reject(error);
  }
}

/**
 * Deletes all stored transactions from the IndexedDB database.
 *
 * @async
 * @function
 * @returns {Promise<boolean>} Resolves with `true` if transactions were successfully deleted.
 * @throws {DOMException} If an error occurs while deleting transactions.
 */
export async function clearTransactions() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tv = db.transaction("transactions", "readwrite");
      const store = tv.objectStore("transactions");
      const request = store.clear();

      request.onsuccess = () => {
        console.log("✅ Transacciones borradas.");
        resolve(true);
      };

      request.onerror = () => {
        console.error("❌ Error al borrar transacciones:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("❌ Error al borrar transacciones:", error);
    return Promise.reject(error);
  }
}

/**
 * Imports a list of transactions into the IndexedDB database.
 *
 * @async
 * @function
 * @param {Array<Object>} transactions - List of transactions to import.
 * @returns {Promise<boolean>} Resolves with `true` if transactions were successfully imported.
 * @throws {DOMException} If an error occurs while importing transactions.
 */
export async function importTransactions(transactions) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const requests = transactions.map((transaction) => store.add(transaction));

      Promise.all(requests).then(() => {
        console.log("✅ Transacciones importadas.");
        resolve(true);
      }).catch((error) => {
        console.error("❌ Error al importar transacciones:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("❌ Error al importar transacciones:", error);
    return Promise.reject(error);
  }
}
