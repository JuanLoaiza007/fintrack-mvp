// GoalList.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import GoalList from "@/components/ui/features/metas/list";

// Mock utils.formatCurrency para devolver un string predecible
jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((amount) => `$${amount}`),
  cn: (...classes) => classes.filter(Boolean).join(" "),
}));

// Mock ScrollArea para simplificar el DOM y centrarnos en GoalListItem
jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }) => <div data-testid="scroll-area">{children}</div>,
}));

describe("GoalList", () => {
  const goals = [
    { id: 1, description: "Goal A", amount: 100, completed: "in-progress" },
    { id: 2, description: "Goal B", amount: 200, completed: "completed" },
    { id: 3, description: "Goal C", amount: 300, completed: "failure" },
  ];

  it("renders empty state message when no goals are provided", () => {
    render(<GoalList goals={[]} />);
    expect(screen.getByText(/no hay metas registradas/i)).toBeInTheDocument();
  });

  it("renders a ScrollArea wrapper", () => {
    render(<GoalList goals={goals} />);
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
  });

  it("renders one GoalListItem per goal", () => {
    render(<GoalList goals={goals} />);
    goals.forEach(({ description }) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it("displays correct badge label and formatted amount for each status", () => {
    render(<GoalList goals={goals} />);

    // In‑progress
    expect(screen.getByText(/EN PROGRESO/i)).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();

    // Completed
    expect(screen.getByText(/COMPLETADA/i)).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();

    // Failure
    expect(screen.getByText(/FALLIDA/i)).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
  });
});
