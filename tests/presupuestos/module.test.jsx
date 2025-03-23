import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BudgetModule from "@/components/ui/features/presupuestos/module";
import * as db from "@/db/db";

jest.mock("@/db/db");

jest.mock("@/components/ui/features/presupuestos/header", () => ({
  __esModule: true,
  default: ({ onOpenCreate, onDelete }) => (
    <>
      <button data-testid="open-create" onClick={() => onOpenCreate(true)}>
        Open Create
      </button>
      <button data-testid="delete-budget" onClick={onDelete}>
        Delete Budget
      </button>
    </>
  ),
}));

jest.mock("@/components/ui/features/presupuestos/expenses", () => ({
  __esModule: true,
  default: () => <div data-testid="budget-expenses" />,
}));

jest.mock("@/components/ui/features/presupuestos/form", () => ({
  __esModule: true,
  default: ({ onSubmit }) => (
    <button data-testid="submit-form" onClick={() => onSubmit({ amount: 100 })}>
      Submit Form
    </button>
  ),
}));

describe("BudgetModule", () => {
  const fakeBudget = { id: 1, amount: 500 };
  const fakeExpenses = [{ id: 1, type: "expense", amount: 50 }];

  beforeEach(() => {
    jest.clearAllMocks();
    db.getBudget.mockResolvedValue([fakeBudget]);
    db.getTransactions.mockResolvedValue(fakeExpenses);
  });

  it("renders budget module with header and expenses", async () => {
    render(<BudgetModule />);
    expect(screen.getByText(/presupuesto mensual/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("budget-expenses")).toBeInTheDocument();
    });
  });

  it("opens create form when clicking create button", async () => {
    render(<BudgetModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    expect(screen.getByTestId("submit-form")).toBeInTheDocument();
  });

  it("calls addBudget on submit when no initial budget", async () => {
    db.getBudget.mockResolvedValue([]);
    render(<BudgetModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    fireEvent.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(db.addBudget).toHaveBeenCalledWith({ amount: 100 });
      expect(db.updateBudget).not.toHaveBeenCalled();
    });
  });

  it("calls updateBudget on submit when a budget exists", async () => {
    render(<BudgetModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    fireEvent.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(db.updateBudget).toHaveBeenCalledWith(fakeBudget.id, {
        amount: 100,
      });
      expect(db.addBudget).not.toHaveBeenCalled();
    });
  });

  it("calls deleteBudget when clicking delete button", async () => {
    render(<BudgetModule />);
    await waitFor(() => screen.getByTestId("delete-budget"));

    fireEvent.click(screen.getByTestId("delete-budget"));

    await waitFor(() => {
      expect(db.deleteBudget).toHaveBeenCalledWith(fakeBudget.id);
    });
  });
});
