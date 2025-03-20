import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TransactionFilters from "@/components/ui/features/transacciones/filters";
import TransactionForm from "@/components/ui/features/transacciones/form";
import { deleteTransaction, updateTransaction, addTransaction } from "@/db/db";
import { useTransactionContext } from "@/context/TransactionContext";
import TransactionModule from "@/components/ui/features/transacciones/module";

// Unificar los mocks en un solo bloque al inicio
jest.mock("@/db/db", () => ({
  deleteTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  addTransaction: jest.fn(),
}));

jest.mock("@/context/TransactionContext", () => ({
  useTransactionContext: jest.fn(),
}));

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

describe("handleDelete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    useTransactionContext.mockReturnValue({
      notifyTransactionUpdate: jest.fn(),
    });
  });

  it("llama a deleteTransaction con el ID correcto y muestra un alert de éxito", async () => {
    const { notifyTransactionUpdate } = useTransactionContext();
    deleteTransaction.mockResolvedValue(true);

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
    expect(global.alert).toHaveBeenCalledWith(
      "Transacción eliminada con éxito",
    );
    expect(notifyTransactionUpdate).toHaveBeenCalled();
  });

  it("muestra un alert de error cuando deleteTransaction falla", async () => {
    const { notifyTransactionUpdate } = useTransactionContext();
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

describe("handleSubmit function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    useTransactionContext.mockReturnValue({
      notifyTransactionUpdate: jest.fn(),
    });
  });

  it("muestra un mensaje de éxito al agregar una transacción", async () => {
    addTransaction.mockResolvedValueOnce(); // Simula que la función se ejecuta sin errores

    render(<TransactionForm transaction={null} setIsCreateOpen={jest.fn()} />);

    // Llenar los campos antes de enviar
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Compra" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: "expense" },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: "Food" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2025-03-19" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId("transaction-form"));
    });

    expect(addTransaction).toHaveBeenCalled(); // Verifica que se ejecutó correctamente
    expect(window.alert).toHaveBeenCalledWith(
      "✅ Transacción agregada exitosamente.",
    );
  });

  it("muestra un mensaje de error al fallar al agregar una transacción", async () => {
    addTransaction.mockRejectedValueOnce(new Error("Error al agregar"));

    render(<TransactionForm transaction={null} setIsCreateOpen={jest.fn()} />);

    // Llenar los campos antes de enviar
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Compra" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: "expense" },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: "Food" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2025-03-19" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId("transaction-form"));
    });

    expect(addTransaction).toHaveBeenCalled(); // Verifica que se ejecutó
    expect(window.alert).toHaveBeenCalledWith(
      "❌ Error al agregar transacción: Error al agregar",
    );
  });
});
