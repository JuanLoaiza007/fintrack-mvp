// tests/transaction-form.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionForm from "@/components/ui/features/transacciones/form";
import { addTransaction } from "@/db/db";

// Hacemos mock de addTransaction para espiar su llamada
jest.mock("@/db/db", () => ({
  addTransaction: jest.fn(),
}));

describe("TransactionForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    // Suponiendo que el valor por defecto de "Tipo" es "income" (Ingreso),
    // simulamos la selección de la opción "expense" (Gasto) en el select "Tipo".

    // Obtenemos el botón del select por su label
    const tipoButton = screen.getByLabelText("Tipo");
    fireEvent.click(tipoButton);

    // Buscamos la opción "Gasto" de forma precisa usando su rol "option"
    const expenseOption = await screen.findByRole("option", { name: "Gasto" });
    fireEvent.click(expenseOption);

    // Ahora se debería renderizar el campo BooleanInput con label "Esencial"
    await waitFor(() => {
      expect(screen.getByText("Esencial")).toBeInTheDocument();
    });
  });

  it("submits the form and calls addTransaction with correct payload", async () => {
    render(<TransactionForm />);

    // Rellenamos los campos de texto/number
    const descriptionInput = screen.getByLabelText("Description");
    fireEvent.change(descriptionInput, {
      target: { value: "Test transaction" },
    });

    const amountInput = screen.getByLabelText("Amount");
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Para el campo "Tipo", seleccionamos "Ingreso" para evitar que aparezca el campo "essential"
    const tipoButton = screen.getByLabelText("Tipo");
    fireEvent.click(tipoButton);
    const incomeOption = await screen.findByRole("option", { name: "Ingreso" });
    fireEvent.click(incomeOption);

    // Para el campo "Category", seleccionamos "Otros"
    const categoryButton = screen.getByLabelText("Category");
    fireEvent.click(categoryButton);
    const categoryOption = await screen.findByRole("option", { name: "Otros" });
    fireEvent.click(categoryOption);

    // Enviamos el formulario
    const submitButton = screen.getByRole("button", { name: /guardar/i });
    fireEvent.click(submitButton);

    console.log(addTransaction.mock.calls);

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalled();
    });

    const payload = addTransaction.mock.calls[0][0];
    expect(payload.description).toBe("Test transaction");
    expect(payload.amount).toBe(100);
    expect(payload.type).toBe("income");
    expect(payload.essential).toBeUndefined();
  });
});
