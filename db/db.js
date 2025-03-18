import { transaccionSchema } from "@/components/schemas/transaccion";

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
