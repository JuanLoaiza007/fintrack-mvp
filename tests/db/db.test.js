import { openDB, addTransaction, getTransactions } from "@/db/db";
import { defaultTransaccion } from "@/components/schemas/transaccion";

describe("db module", () => {
  let fakeTransactionStore;
  let fakeTx;
  let fakeDB;
  let fakeOpenRequest;

  beforeEach(() => {
    fakeTransactionStore = {
      add: jest.fn(),
      getAll: jest.fn(),
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
      { id: 1, ...defaultTransaccion, description: "Test", amount: 100, type: "expense" },
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
});
