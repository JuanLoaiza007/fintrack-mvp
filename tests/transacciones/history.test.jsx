import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionHistory from "@/components/ui/features/transacciones/history";
import { getTransactions, deleteTransaction } from "@/db/db";

// Mock database functions
jest.mock("@/db/db", () => ({
  getTransactions: jest.fn(),
  deleteTransaction: jest.fn(() => Promise.resolve(true)),
}));

// Mock TransactionContext to bypass provider wrapping
jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: () => ({
    transactionUpdated: false,
    notifyTransactionUpdate: jest.fn(),
  }),
}));

describe("TransactionHistory Component", () => {
  const dummyOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and main sections with proper aria labels", async () => {
    getTransactions.mockResolvedValueOnce([]);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    expect(screen.getByLabelText("Transaction History")).toBeInTheDocument();
    expect(screen.getByLabelText("Transaction Filters")).toBeInTheDocument();
    expect(screen.getByLabelText("Transaction List")).toBeInTheDocument();
  });

  it("renders empty state when no transactions are returned", async () => {
    getTransactions.mockResolvedValueOnce([]);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(
        screen.getByText(/No hay transacciones registradas./i),
      ).toBeInTheDocument();
    });
  });

  it("renders a list of transactions when data is available", async () => {
    const fakeTransactions = [
      {
        id: 1,
        description: "Test Income",
        amount: 100,
        type: "income",
        category: "food",
        essential: false,
        date: "2025-03-18",
      },
      {
        id: 2,
        description: "Test Expense",
        amount: 200,
        type: "expense",
        category: "shopping",
        essential: true,
        date: "2025-03-19",
      },
    ];
    getTransactions.mockResolvedValueOnce(fakeTransactions);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(screen.getByText(/Test Income/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Expense/i)).toBeInTheDocument();
    });
  });

  it("calls onEdit when the edit button is clicked", async () => {
    const fakeTransactions = [
      {
        id: 1,
        description: "Test Income",
        amount: 100,
        type: "income",
        category: "food",
        essential: false,
        date: "2025-03-18",
      },
    ];
    getTransactions.mockResolvedValueOnce(fakeTransactions);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(screen.getByText(/Test Income/i)).toBeInTheDocument();
    });
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);
    expect(dummyOnEdit).toHaveBeenCalledWith(fakeTransactions[0]);
  });

  it("calls deleteTransaction when the delete button is clicked", async () => {
    const fakeTransactions = [
      {
        id: 1,
        description: "Test Expense",
        amount: 200,
        type: "expense",
        category: "shopping",
        essential: true,
        date: "2025-03-19",
      },
    ];
    getTransactions.mockResolvedValueOnce(fakeTransactions);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(screen.getByText(/Test Expense/i)).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith(1);
    });
  });

  it("renders the component without crashing", () => {
    getTransactions.mockResolvedValueOnce([]);
    const { container } = render(<TransactionHistory onEdit={dummyOnEdit} />);
    expect(container).toBeDefined();
  });

  it("logs an error when getTransactions fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getTransactions.mockRejectedValueOnce(new Error("DB error"));
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al obtener transacciones:",
        expect.any(Error),
      );
    });
    consoleErrorSpy.mockRestore();
  });
});
