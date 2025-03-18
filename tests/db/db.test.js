// tests/transacciones/item.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionItem from "@/components/ui/features/transacciones/item";

describe("TransactionItem Component", () => {
  const dummyHandleEdit = jest.fn();
  const dummyHandleDelete = jest.fn();

  const transaction = {
    id: 1,
    description: "Test Income",
    amount: 500,
    type: "income",
    category: "food",
    essential: true,
    date: "2025-03-18T00:00:00",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders transaction details correctly", () => {
    render(
      <TransactionItem
        transaction={transaction}
        handleEdit={dummyHandleEdit}
        handleDelete={dummyHandleDelete}
      />
    );

    // Check that the description is rendered
    expect(screen.getByText(/Test Income/i)).toBeInTheDocument();
    // Check that the formatted amount is rendered (using a flexible matcher for COP formatting)
    expect(
      screen.getByText(
        (content) => content.includes("$") && content.includes("500")
      )
    ).toBeInTheDocument();
    // Check that the type label "Ingresos" is rendered
    expect(screen.getByText(/Ingresos/i)).toBeInTheDocument();
    // Check that the category label "Comida y Bebida" is rendered
    expect(screen.getByText(/Comida y Bebida/i)).toBeInTheDocument();
    // Check that the formatted date appears
    expect(screen.getByText("18/03/2025")).toBeInTheDocument();
  });

  test("calls handleEdit and handleDelete when action buttons are clicked", () => {
    render(
      <TransactionItem
        transaction={transaction}
        handleEdit={dummyHandleEdit}
        handleDelete={dummyHandleDelete}
      />
    );

    const editButton = screen.getByRole("button", { name: /Editar/i });
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });

    fireEvent.click(editButton);
    expect(dummyHandleEdit).toHaveBeenCalledWith(transaction.id);

    fireEvent.click(deleteButton);
    expect(dummyHandleDelete).toHaveBeenCalledWith(transaction.id);
  });
});
