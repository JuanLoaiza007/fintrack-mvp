// __tests__/GoalModule.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import GoalModule from "@/components/ui/features/metas/module";
import * as db from "@/db/db";
import { cn, isDateInNowMonth } from "@/lib/utils";

jest.mock("@/db/db");
jest.mock("@/lib/utils", () => ({
  isDateInNowMonth: jest.fn(),
  cn: (...classes) => classes.filter(Boolean).join(" "),
}));

// Mock child components to focus on GoalModule logic
jest.mock("@/components/ui/features/metas/header", () => ({
  __esModule: true,
  default: ({ onOpenCreate, onListOpen, onDelete }) => (
    <>
      <button data-testid="open-create" onClick={() => onOpenCreate(true)}>
        Open Create
      </button>
      <button data-testid="open-list" onClick={() => onListOpen(true)}>
        Open List
      </button>
      <button data-testid="delete-goal" onClick={onDelete}>
        Delete Goal
      </button>
    </>
  ),
}));
jest.mock("@/components/ui/features/metas/form", () => ({
  __esModule: true,
  default: ({ onSubmit }) => (
    <button data-testid="submit-form" onClick={() => onSubmit({ foo: "bar" })}>
      Submit Form
    </button>
  ),
}));
jest.mock("@/components/ui/features/metas/main", () => ({
  __esModule: true,
  default: () => <div data-testid="goal-main" />,
}));
jest.mock("@/components/ui/features/metas/list", () => ({
  __esModule: true,
  default: () => <div data-testid="goal-list" />,
}));

describe("GoalModule", () => {
  const fakeGoals = [{ id: 1, targetDate: "2025-03-01" }];
  const fakeTransactions = [{ id: 1, date: "2025-03-05" }];

  beforeEach(() => {
    jest.clearAllMocks();
    db.getGoals.mockResolvedValue(fakeGoals);
    db.getTransactions.mockResolvedValue(fakeTransactions);
    isDateInNowMonth.mockReturnValue(true);
  });

  it("shows loading then renders header & main", async () => {
    render(<GoalModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("open-create")).toBeInTheDocument();
      expect(screen.getByTestId("goal-main")).toBeInTheDocument();
    });
  });

  it("opens create sheet when clicking create button", async () => {
    render(<GoalModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    expect(screen.getByTestId("submit-form")).toBeInTheDocument();
  });

  it("calls addGoal on submit when no initial goal", async () => {
    db.getGoals.mockResolvedValue([]); // no existing
    render(<GoalModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    fireEvent.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(db.addGoal).toHaveBeenCalledWith({ foo: "bar" });
      expect(db.updateGoal).not.toHaveBeenCalled();
    });
  });

  it("calls updateGoal on submit when a goal exists", async () => {
    render(<GoalModule />);
    await waitFor(() => screen.getByTestId("open-create"));

    fireEvent.click(screen.getByTestId("open-create"));
    fireEvent.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(db.updateGoal).toHaveBeenCalledWith(fakeGoals[0].id, {
        foo: "bar",
      });
      expect(db.addGoal).not.toHaveBeenCalled();
    });
  });

  it("opens list dialog when clicking list button", async () => {
    render(<GoalModule />);
    await waitFor(() => screen.getByTestId("open-list"));

    fireEvent.click(screen.getByTestId("open-list"));
    expect(screen.getByTestId("goal-list")).toBeInTheDocument();
  });

  it("calls deleteGoal when clicking delete button", async () => {
    render(<GoalModule />);
    await waitFor(() => screen.getByTestId("delete-goal"));

    fireEvent.click(screen.getByTestId("delete-goal"));

    await waitFor(() => {
      expect(db.deleteGoal).toHaveBeenCalledWith(fakeGoals[0].id);
    });
  });

  it("logs error if getGoals rejects", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    db.getGoals.mockRejectedValue(new Error("fail"));
    render(<GoalModule />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("fail"));
    spy.mockRestore();
  });
});
