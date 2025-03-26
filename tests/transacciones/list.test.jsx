import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionList from "@/components/ui/features/transacciones/list";

describe("TransactionList Component", () => {
  const dummyHandleEdit = jest.fn();
  const dummyHandleDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no transactions are provided", () => {
    render(
      <TransactionList
        transactions={[]}
        handleEdit={dummyHandleEdit}
        handleDelete={dummyHandleDelete}
      />,
    );
    expect(
      screen.getByText("No hay transacciones registradas."),
    ).toBeInTheDocument();
  });

  it("renders a list of transaction items when transactions are provided", () => {
    const transactions = [
      {
        id: 1,
        description: "Test Income",
        amount: 500,
        type: "income",
        category: "food",
        essential: true,
        date: "2025-03-18T00:00:00",
      },
      {
        id: 2,
        description: "Test Expense",
        amount: 300,
        type: "expense",
        category: "shopping",
        essential: false,
        date: "2025-03-19T00:00:00",
      },
    ];

    render(
      <TransactionList
        transactions={transactions}
        handleEdit={dummyHandleEdit}
        handleDelete={dummyHandleDelete}
      />,
    );
    expect(screen.getByText(/Test Income/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Expense/i)).toBeInTheDocument();
  });

  it("calls handleEdit and handleDelete when action buttons are clicked", () => {
    const transactions = [
      {
        id: 1,
        description: "Test Income",
        amount: 500,
        type: "income",
        category: "food",
        essential: true,
        date: "2025-03-18T00:00:00",
      },
    ];

    render(
      <TransactionList
        transactions={transactions}
        handleEdit={dummyHandleEdit}
        handleDelete={dummyHandleDelete}
      />,
    );

    const editButton = screen.getByRole("button", { name: /Editar/i });
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });

    fireEvent.click(editButton);
    expect(dummyHandleEdit).toHaveBeenCalledWith(1);

    fireEvent.click(deleteButton);
    expect(dummyHandleDelete).toHaveBeenCalledWith(1);
  });
});
