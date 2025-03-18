import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionForm from "@/components/ui/features/transacciones/form";
import { addTransaction } from "@/db/db";
import { useTransactionContext } from "@/context/TransactionContext";

// Hacemos mock de addTransaction para espiar su llamada
jest.mock("@/db/db", () => ({
  addTransaction: jest.fn(),
}));

// Mock de useTransactionContext para evitar el error de TransactionProvider
jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: jest.fn(() => ({
    notifyTransactionUpdate: jest.fn(),
  })),
}));

describe("TransactionForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTransactionContext.mockReturnValue({
      notifyTransactionUpdate: jest.fn(),
    });
  });

  it("renders all form fields", () => {
    render(<TransactionForm />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha")).toBeInTheDocument();
  });

  it("renders BooleanInput (Esencial) when type is expense", async () => {
    render(<TransactionForm />);
    const tipoButton = screen.getByLabelText("Tipo");
    fireEvent.click(tipoButton);
    const expenseOptions = await screen.findAllByRole("option", {
      name: /Gastos/i,
    });
    fireEvent.click(expenseOptions[0]);
    await waitFor(() => {
      expect(screen.getByText("Esencial")).toBeInTheDocument();
    });
  });

  it("submits the form and calls addTransaction with correct payload", async () => {
    const mockNotifyTransactionUpdate = jest.fn();
    useTransactionContext.mockReturnValue({
      notifyTransactionUpdate: mockNotifyTransactionUpdate,
    });
    render(<TransactionForm setIsCreateOpen={(some) => {}} />);
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Test transaction" },
    });
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "100" },
    });
    const tipoButton = screen.getByLabelText("Tipo");
    fireEvent.click(tipoButton);
    const incomeOptions = await screen.findAllByRole("option", {
      name: /Ingresos/i,
    });
    fireEvent.click(incomeOptions[0]);
    const categoryButton = screen.getByLabelText("Category");
    fireEvent.click(categoryButton);
    const categoryOptions = await screen.findAllByRole("option", {
      name: /Otros/i,
    });
    fireEvent.click(categoryOptions[0]);
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalled();
      expect(mockNotifyTransactionUpdate).toHaveBeenCalled();
    });
    const payload = addTransaction.mock.calls[0][0];
    expect(payload.description).toBe("Test transaction");
    expect(payload.amount).toBe(100);
    expect(payload.type).toBe("income");
    expect(payload.essential).toBeUndefined();
  });
});
