import React from "react";
import { render, screen } from "@testing-library/react";
import BudgetExpenses from "@/components/ui/features/presupuestos/expenses";

const mockExpenses = [
  {
    id: 1,
    description: "Groceries",
    amount: 100,
    type: "expense",
    category: "food",
    essential: true,
    date: new Date().toISOString(),
  },
  {
    id: 2,
    description: "Internet Bill",
    amount: 50,
    type: "expense",
    category: "utilities",
    essential: false,
    date: new Date().toISOString(),
  },
];

describe("BudgetExpenses", () => {
  it("renders the component correctly", () => {
    render(<BudgetExpenses expenses={mockExpenses} />);
    expect(screen.getByText("Gastos del mes")).toBeInTheDocument();
  });

  it("displays a message when there are no expenses", () => {
    render(<BudgetExpenses expenses={[]} />);
    expect(
      screen.getByText("No hay gastos registrados este mes."),
    ).toBeInTheDocument();
  });

  it("renders a list of expenses", () => {
    render(<BudgetExpenses expenses={mockExpenses} />);
    expect(screen.getByText("Groceries - $100")).toBeInTheDocument();
    expect(screen.getByText("Internet Bill - $50")).toBeInTheDocument();
  });
});
