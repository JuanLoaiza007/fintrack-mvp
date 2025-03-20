import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionItem from "@/components/ui/features/transacciones/item";

describe("TransactionItem Component", () => {
  const sampleTransaction = {
    id: 1,
    description: "Test Income",
    amount: 500,
    type: "income",
    category: "food",
    essential: false,
    date: "2025-03-18T00:00:00",
  };

  const mockHandleEdit = jest.fn();
  const mockHandleDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders transaction details correctly", () => {
    render(
      <TransactionItem
        transaction={sampleTransaction}
        handleEdit={mockHandleEdit}
        handleDelete={mockHandleDelete}
      />,
    );

    // Check that the description is rendered
    expect(screen.getByText(/Test Income/i)).toBeInTheDocument();

    // Check that the formatted amount is rendered (currency symbol "COP" is part of it)
    expect(
      screen.getByText(
        (content) => content.includes("$") && content.includes("500"),
      ),
    ).toBeInTheDocument();

    // Check that at least one element with type label "Ingresos" is rendered
    const typeElements = screen.getAllByText(/Ingresos/i);
    expect(typeElements.length).toBeGreaterThan(0);

    // Check that the category label "Comida y Bebida" is rendered for category "food"
    expect(screen.getByText(/Comida y Bebida/i)).toBeInTheDocument();

    // Check that the date is formatted as "18/03/2025"
    expect(screen.getByText("18/03/2025")).toBeInTheDocument();
  });

  it("calls handleEdit and handleDelete when action buttons are clicked", () => {
    render(
      <TransactionItem
        transaction={sampleTransaction}
        handleEdit={mockHandleEdit}
        handleDelete={mockHandleDelete}
      />,
    );

    const editButton = screen.getByRole("button", { name: /Editar/i });
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });

    fireEvent.click(editButton);
    expect(mockHandleEdit).toHaveBeenCalledWith(sampleTransaction.id);

    fireEvent.click(deleteButton);
    expect(mockHandleDelete).toHaveBeenCalledWith(sampleTransaction.id);
  });
});
