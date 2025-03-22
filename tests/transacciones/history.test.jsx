import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionHistory from "@/components/ui/features/transacciones/history";
import { getTransactions, deleteTransaction } from "@/db/db";
import { useTransactionContext } from "@/context/TransactionContext";

// Mock database functions
jest.mock("@/db/db", () => ({
  getTransactions: jest.fn(),
  deleteTransaction: jest.fn(() => Promise.resolve(true)),
}));

// Mock the TransactionContext to avoid Provider wrapping
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

  it("renders empty state when no transactions are returned", async () => {
    getTransactions.mockResolvedValueOnce([]);
    render(<TransactionHistory onEdit={dummyOnEdit} />);
    await waitFor(() => {
      expect(
        screen.getByText("No hay transacciones registradas."),
      ).toBeInTheDocument();
    });
  });

  it("renders a list of transactions when data is returned", async () => {
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

  it("calls onEdit when a transaction edit action is triggered", async () => {
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
    // Simulate clicking the edit button on the first transaction
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);
    expect(dummyOnEdit).toHaveBeenCalledWith(fakeTransactions[0]);
  });

  it("calls deleteTransaction and updates when delete action is triggered", async () => {
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
    // Simulate clicking the delete button on the transaction
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith(1);
    });
  });
});
