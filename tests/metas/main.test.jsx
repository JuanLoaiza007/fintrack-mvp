// GoalMain.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import GoalMain from "@/components/ui/features/metas/main";

// Mockeamos el componente Goal para poder verificar que recibe correctamente los props
jest.mock("@/components/ui/features/metas/goal", () => ({
  Goal: jest.fn(({ goal, transactions }) => (
    <div data-testid="mock-goal">
      {goal.name} — {transactions.length} transacción(es)
    </div>
  )),
}));

describe("GoalMain", () => {
  const goal = { id: 1, name: "Save for a car", target: 5000 };
  const transactions = [
    { id: 1, amount: 200, date: "2023-01-01" },
    { id: 2, amount: 150, date: "2023-01-15" },
  ];

  it("renders wrapper container with correct Tailwind classes", () => {
    render(<GoalMain goal={goal} transactions={transactions} />);

    const wrapper = screen.getByTestId("mock-goal").parentElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass(
      "flex",
      "flex-col",
      "w-full",
      "h-full",
      "bg-sidebar-accent",
      "rounded-lg",
      "shadow-lg",
      "p-4",
    );
  });

  it("renders Goal component with the provided goal and transactions props", () => {
    render(<GoalMain goal={goal} transactions={transactions} />);

    const goalElement = screen.getByTestId("mock-goal");
    expect(goalElement).toHaveTextContent("Save for a car — 2 transacción(es)");
  });

  it("handles empty transactions array without crashing", () => {
    render(<GoalMain goal={goal} transactions={[]} />);

    const goalElement = screen.getByTestId("mock-goal");
    expect(goalElement).toHaveTextContent("Save for a car — 0 transacción(es)");
  });
});
