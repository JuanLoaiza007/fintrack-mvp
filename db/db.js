import { transaccionSchema } from "@/components/schemas/transaccion";
import { budgetSchema } from "@/components/schemas/budget";

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
    const request = indexedDB.open("FinanzasDB", 3);

    request.onupgradeneeded = (event) => {
      console.log("🛠️ Verificando y creando almacenes...");
      const db = event.target.result;

      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
        console.log("✅ Almacén de transacciones creado.");
      }

      if (!db.objectStoreNames.contains("goals")) {
        db.createObjectStore("goals", { keyPath: "id" });
        console.log("✅ Almacén de metas creado.");
      }

      if (!db.objectStoreNames.contains("budget")) {
        db.createObjectStore("budget", { keyPath: "id" });
        console.log("✅ Almacén de presupuestos creado.");
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
      const requests = transactions.map((transaction) =>
        store.add(transaction),
      );

      Promise.all(requests)
        .then(() => {
          console.log("✅ Transacciones importadas.");
          resolve(true);
        })
        .catch((error) => {
          console.error("❌ Error al importar transacciones:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("❌ Error al importar transacciones:", error);
    return Promise.reject(error);
  }
}

/**
 * Updates a transaction in the database with the given ID and updated data.
 *
 * @async
 * @function
 * @param {number} id - The ID of the transaction to update. Must be a valid number.
 * @param {Object} updatedData - The updated data for the transaction.
 * @returns {Promise<boolean>} Resolves to `true` if the transaction was successfully updated.
 * @throws {Error} Throws an error if the ID is invalid, the transaction is not found, or an update error occurs.
 *
 * @example
 * const updatedData = { amount: 100, description: "Updated transaction" };
 * updateTransaction(1, updatedData)
 *   .then((result) => console.log("Transaction updated:", result))
 *   .catch((error) => console.error("Error updating transaction:", error));
 */
export async function updateTransaction(id, updatedData) {
  try {
    if (!id || typeof id !== "number") {
      return Promise.reject(
        new Error("Error: ID de transacción inválido o no existe."),
      );
    }
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");

      const updateRequest = store.put({ id, ...updatedData });

      updateRequest.onsuccess = () => {
        console.log("✅ Transacción actualizada:", updatedData);
        resolve(true);
      };

      updateRequest.onerror = () => {
        console.error(
          "❌ Error al actualizar transacción:",
          updateRequest.error,
        );
        reject(
          new Error(
            "Error al actualizar transacción o transacción no encontrada",
          ),
        );
      };
    });
  } catch (error) {
    console.error("❌ Error de validación:", error.message || error.errors);
    return Promise.reject(error.message || error.errors);
  }
}

/**
 * Adds a new goal to the "goals" object store in the database.
 *
 * @async
 * @function
 * @param {Object} goal - The goal object to be added. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the goal is successfully added.
 * @throws {DOMException} If an error occurs during the transaction or addition process.
 *
 * @example
 * const newGoal = { title: "Save for a car", amount: 5000 };
 * addGoal(newGoal)
 *   .then((result) => console.log("Goal added:", result))
 *   .catch((error) => console.error("Error adding goal:", error));
 */
export async function addGoal(goal) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("goals", "readwrite");
    tx.objectStore("goals").add({ ...goal, id: Date.now() }).onsuccess = () =>
      res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Retrieves all goals from the "goals" object store in the database.
 *
 * @async
 * @function
 * @returns {Promise<Array<Object>>} Resolves to an array of goal objects if successful.
 * @throws {DOMException} If an error occurs during the transaction or retrieval process.
 *
 * @example
 * getGoals()
 *   .then((goals) => console.log("Goals retrieved:", goals))
 *   .catch((error) => console.error("Error retrieving goals:", error));
 */
export async function getGoals() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("goals", "readonly");
    tx.objectStore("goals").getAll().onsuccess = (e) => res(e.target.result);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Updates an existing goal in the "goals" object store in the database.
 *
 * @async
 * @function
 * @param {number|string} id - The unique identifier of the goal to update. Required.
 * @param {Object} goal - The updated goal data. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the goal is successfully updated.
 * @throws {DOMException} If an error occurs during the transaction or update process.
 *
 * @example
 * const updatedGoal = { title: "Save for vacation", amount: 2000 };
 * updateGoal(12345, updatedGoal)
 *   .then((result) => console.log("Goal updated:", result))
 *   .catch((error) => console.error("Error updating goal:", error));
 */
export async function updateGoal(id, goal) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("goals", "readwrite");
    tx.objectStore("goals").put({ id, ...goal }).onsuccess = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Deletes a goal from the "goals" object store in the database by its ID.
 *
 * @async
 * @function
 * @param {number|string} id - The unique identifier of the goal to delete. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the goal is successfully deleted.
 * @throws {DOMException} If an error occurs during the transaction or deletion process.
 *
 * @example
 * deleteGoal(12345)
 *   .then((result) => console.log("Goal deleted:", result))
 *   .catch((error) => console.error("Error deleting goal:", error));
 */
export async function deleteGoal(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("goals", "readwrite");
    tx.objectStore("goals").delete(id).onsuccess = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Retrieves all budget records from the "budget" object store in the database.
 *
 * @async
 * @function
 * @returns {Promise<Object[]>} Resolves with an array of budget objects if successful.
 * @throws {DOMException} If an error occurs during the transaction or retrieval process.
 *
 * @example
 * getBudget()
 *   .then((budgets) => console.log("Budgets retrieved:", budgets))
 *   .catch((error) => console.error("Error retrieving budgets:", error));
 */
export async function getBudget() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("budget", "readonly");
    tx.objectStore("budget").getAll().onsuccess = (e) => res(e.target.result);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Adds a new budget entry to the "budget" object store in the database.
 *
 * @async
 * @function
 * @param {Object} budget - The budget object to be added. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the budget is successfully added.
 * @throws {DOMException} If an error occurs during the transaction or addition process.
 *
 * @example
 * const newBudget = { amount: 1000, description: "Monthly groceries" };
 * addBudget(newBudget)
 *   .then((result) => console.log("Budget added:", result))
 *   .catch((error) => console.error("Error adding budget:", error));
 */
export async function addBudget(budget) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("budget", "readwrite");
    tx.objectStore("budget").add({ ...budget, id: Date.now() }).onsuccess =
      () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Updates an existing budget entry in the "budget" object store in the database.
 *
 * @async
 * @function
 * @param {number} id - The unique identifier of the budget to update. Required.
 * @param {Object} budget - The updated budget object. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the budget is successfully updated.
 * @throws {DOMException} If an error occurs during the transaction or update process.
 *
 * @example
 * const updatedBudget = { amount: 1200, description: "Updated groceries budget" };
 * updateBudget(1, updatedBudget)
 *   .then((result) => console.log("Budget updated:", result))
 *   .catch((error) => console.error("Error updating budget:", error));
 */
export async function updateBudget(id, budget) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("budget", "readwrite");
    tx.objectStore("budget").put({ id, ...budget }).onsuccess = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/**
 * Deletes a budget entry from the "budget" object store in the database.
 *
 * @async
 * @function
 * @param {number} id - The unique identifier of the budget to delete. Required.
 * @returns {Promise<boolean>} Resolves to `true` if the budget is successfully deleted.
 * @throws {DOMException} If an error occurs during the transaction or deletion process.
 *
 * @example
 * deleteBudget(1)
 *   .then((result) => console.log("Budget deleted:", result))
 *   .catch((error) => console.error("Error deleting budget:", error));
 */
export async function deleteBudget(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("budget", "readwrite");
    tx.objectStore("budget").delete(id).onsuccess = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}
