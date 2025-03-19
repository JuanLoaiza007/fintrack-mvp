import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionFilters from "@/components/ui/features/transacciones/filters";
import { deleteTransaction } from "@/db/db"; // Mockearemos esta función
import { useTransactionContext } from "@/context/TransactionContext";

describe("TransactionFilters", () => {
  const mockSetDateFilter = jest.fn();
  const mockSetTypeFilter = jest.fn();
  const mockSetCategoryFilter = jest.fn();
  const mockSetSortField = jest.fn();
  const mockSetSortOrder = jest.fn();

  const defaultProps = {
    dateFilter: "all",
    setDateFilter: mockSetDateFilter,
    typeFilter: "all",
    setTypeFilter: mockSetTypeFilter,
    categoryFilter: "all",
    setCategoryFilter: mockSetCategoryFilter,
    sortField: "date",
    setSortField: mockSetSortField,
    sortOrder: "asc",
    setSortOrder: mockSetSortOrder,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all filter labels and reset button", () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByText("Periodo:")).toBeInTheDocument();
    expect(screen.getByText("Tipo:")).toBeInTheDocument();
    expect(screen.getByText("Categoría:")).toBeInTheDocument();
    expect(screen.getByText("Ordenar por:")).toBeInTheDocument();
    expect(screen.getByText(/Restablecer filtros/i)).toBeInTheDocument();
  });

  it("calls reset functions when reset button is clicked", () => {
    render(<TransactionFilters {...defaultProps} />);
    const resetButton = screen.getByText(/Restablecer filtros/i);
    fireEvent.click(resetButton);
    expect(mockSetDateFilter).toHaveBeenCalledWith("all");
    expect(mockSetTypeFilter).toHaveBeenCalledWith("all");
    expect(mockSetCategoryFilter).toHaveBeenCalledWith("all");
    expect(mockSetSortField).toHaveBeenCalledWith("date");
    expect(mockSetSortOrder).toHaveBeenCalledWith("dsc");
  });
});

jest.mock("@/db/db", () => ({
  deleteTransaction: jest.fn(),
}));

jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: () => ({
    transactionUpdated: jest.fn(),
    notifyTransactionUpdate: jest.fn(),
  }),
}));

describe("handleDelete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("llama a deleteTransaction con el ID correcto y muestra un alert de éxito", async () => {
    const { notifyTransactionUpdate } = useTransactionContext();
    global.alert = jest.fn(); // Mock del alert
    deleteTransaction.mockResolvedValue(true); // Simula que la transacción se elimina correctamente

    const testId = 123;
    const handleDelete = async (id) => {
      await deleteTransaction(id)
        .then(() => {
          window.alert("Transacción eliminada con éxito");
        })
        .catch((error) => {
          window.alert(error.message);
        });
      notifyTransactionUpdate();
    };

    await handleDelete(testId);

    expect(deleteTransaction).toHaveBeenCalledWith(testId);
    expect(global.alert).toHaveBeenCalledWith("Transacción eliminada con éxito");
    expect(notifyTransactionUpdate).toHaveBeenCalled();
  });

  it("muestra un alert de error cuando deleteTransaction falla", async () => {
    const { notifyTransactionUpdate } = useTransactionContext();
    global.alert = jest.fn();
    const errorMessage = "Error al eliminar";
    deleteTransaction.mockRejectedValue(new Error(errorMessage));

    const testId = 456;
    const handleDelete = async (id) => {
      await deleteTransaction(id)
        .then(() => {
          window.alert("Transacción eliminada con éxito");
        })
        .catch((error) => {
          window.alert(error.message);
        });
      notifyTransactionUpdate();
    };

    await handleDelete(testId);

    expect(deleteTransaction).toHaveBeenCalledWith(testId);
    expect(global.alert).toHaveBeenCalledWith(errorMessage);
    expect(notifyTransactionUpdate).toHaveBeenCalled();
  });
});