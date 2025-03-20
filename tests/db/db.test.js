import {
  openDB,
  addTransaction,
  getTransactions,
  importTransactions,
  deleteTransaction,
  clearTransactions,
  updateTransaction,
} from "@/db/db";
import { defaultTransaccion } from "@/components/schemas/transaccion";
import { Weight } from "lucide-react";

describe("db module", () => {
  let fakeTransactionStore;
  let fakeTx;
  let fakeDB;
  let fakeOpenRequest;

  beforeEach(() => {
    fakeTransactionStore = {
      add: jest.fn(),
      getAll: jest.fn(),
      clear: jest.fn(),
    };

    fakeTx = {
      objectStore: jest.fn(() => fakeTransactionStore),
    };

    fakeDB = {
      transaction: jest.fn(() => fakeTx),
      objectStoreNames: {
        contains: jest.fn(() => true),
      },
    };

    fakeOpenRequest = {
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: fakeDB,
    };

    global.indexedDB = {
      open: jest.fn(() => fakeOpenRequest),
    };

    setTimeout(() => {
      if (fakeOpenRequest.onsuccess) {
        fakeOpenRequest.onsuccess({ target: fakeOpenRequest });
      }
    }, 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.indexedDB;
  });

  test("openDB returns a DB object", async () => {
    await expect(openDB()).resolves.toBe(fakeDB);
    expect(global.indexedDB.open).toHaveBeenCalledWith("FinanzasDB", 1);
  }, 10000);

  test("getTransactions returns transactions array", async () => {
    const fakeData = [
      {
        id: 1,
        ...defaultTransaccion,
        description: "Test",
        amount: 100,
        type: "expense",
      },
    ];

    fakeTransactionStore.getAll.mockImplementation(() => {
      const req = { onsuccess: null, result: fakeData };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess({ target: req });
      }, 0);
      return req;
    });

    await expect(getTransactions()).resolves.toEqual(fakeData);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
  }, 10000);

  test("addTransaction returns true for valid transaction", async () => {
    fakeTransactionStore.add.mockImplementation(() => {
      const req = { onsuccess: null };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    });

    const payload = {
      ...defaultTransaccion,
      description: "Test",
      amount: 100,
      date: "2025-03-18",
      type: "income",
    };

    await expect(addTransaction(payload)).resolves.toBe(true);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
    expect(fakeTransactionStore.add).toHaveBeenCalled();
  }, 10000);

  test("deleteTransaction should delete a transaction successfully", async () => {
    fakeTransactionStore.delete = jest.fn(() => {
      const req = { onsuccess: null };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    });

    await expect(deleteTransaction(1)).resolves.toBe(true);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
    expect(fakeTransactionStore.delete).toHaveBeenCalledWith(1);
  }, 10000);

  test("deleteTransaction should reject when transaction deletion fails", async () => {
    const errorMessage = "Failed to delete transaction";
    fakeTransactionStore.delete = jest.fn(() => {
      const req = { onerror: null, error: new Error(errorMessage) };
      setTimeout(() => {
        if (req.onerror) req.onerror({ target: req });
      }, 0);
      return req;
    });

    await expect(deleteTransaction(1)).rejects.toThrow(errorMessage);
  }, 10000);

  test("deleteTransaction should throw an error if transactionId is invalid", async () => {
    await expect(deleteTransaction(null)).rejects.toThrow(
      "El ID de la transacción debe ser un número válido.",
    );

    await expect(deleteTransaction("abc")).rejects.toThrow(
      "El ID de la transacción debe ser un número válido.",
    );
  }, 10000);

  test("clearTransactions should clear all transactions", async () => {
    fakeTransactionStore.clear.mockImplementation(() => {
      const req = { onsuccess: null };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    });

    await expect(clearTransactions()).resolves.toBe(true);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
    expect(fakeTransactionStore.clear).toHaveBeenCalled();
  }, 10000);

  test("clearTransactions should reject on error", async () => {
    const errorMessage = "Failed to clear transactions";
    fakeTransactionStore.clear.mockImplementation(() => {
      const req = { onerror: null, error: new Error(errorMessage) };
      setTimeout(() => {
        if (req.onerror) req.onerror({ target: req });
      }, 0);
      return req;
    });

    await expect(clearTransactions()).rejects.toThrow(errorMessage);
  }, 10000);

  test("importTransactions should add all transactions successfully", async () => {
    fakeTransactionStore.add.mockImplementation(() => {
      const req = { onsuccess: null };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    });

    const transactions = [
      { id: 1, description: "Test 1", amount: 100, type: "income" },
      { id: 2, description: "Test 2", amount: 200, type: "expense" },
    ];

    await expect(importTransactions(transactions)).resolves.toBe(true);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
    expect(fakeTransactionStore.add).toHaveBeenCalledTimes(transactions.length);
  }, 10000);

  test("importTransactions should handle an empty transaction array", async () => {
    await expect(importTransactions([])).resolves.toBe(true);
  }, 10000);

  test("updateTransaction should update a transaction successfully", async () => {
    fakeTransactionStore.put = jest.fn(() => {
      const req = { onsuccess: null };
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    });

    const updatedTransaction = {
      id: 1,
      description: "Updated Test",
      amount: 200,
      type: "income",
    };

    await expect(updateTransaction(1, updatedTransaction)).resolves.toBe(true);
    expect(fakeTx.objectStore).toHaveBeenCalledWith("transactions");
    expect(fakeTransactionStore.put).toHaveBeenCalledWith(updatedTransaction);
  }, 10000);

  test("updateTransaction should reject when transaction does not exist", async () => {
    fakeTransactionStore.put = jest.fn(() => {
      const req = {
        onerror: null,
        error: new Error("Error: ID de transacción inválido o no existe."),
      };
      setTimeout(() => {
        if (req.onerror) req.onerror({ target: req });
      }, 0);
      return req;
    });

    const updatedTransaction = {
      id: 99,
      description: "Non-existent",
      amount: 300,
      type: "expense",
    };

    await expect(updateTransaction(updatedTransaction)).rejects.toThrow(
      "Error: ID de transacción inválido o no existe",
    );
  }, 10000);

  test("updateTransaction should throw an error if transactionId is invalid", async () => {
    await expect(updateTransaction(null)).rejects.toThrow(
      "Error: ID de transacción inválido o no existe.",
    );

    await expect(updateTransaction({ id: "abc" })).rejects.toThrow(
      "Error: ID de transacción inválido o no existe.",
    );
  }, 10000);

  test("updateTransaction should reject on database error", async () => {
    fakeTransactionStore.put = jest.fn(() => {
      const req = {
        onerror: null,
        error: new Error("Error: ID de transacción inválido o no existe."),
      };
      setTimeout(() => {
        if (req.onerror) req.onerror({ target: req });
      }, 0);
      return req;
    });

    const updatedTransaction = {
      id: 2,
      description: "DB Error",
      amount: 400,
      type: "income",
    };

    await expect(updateTransaction(updatedTransaction)).rejects.toThrow(
      "Error: ID de transacción inválido o no existe",
    );
  }, 10000);
});
