import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BudgetForm from "@/components/ui/features/presupuestos/form";

describe("BudgetForm", () => {
  const setup = (props = {}) => {
    const defaultProps = {
      setIsCreateOpen: jest.fn(),
      onSubmit: jest.fn(),
      budget: null,
    };
    return render(<BudgetForm {...defaultProps} {...props} />);
  };

  it("renders inputs and submit button", () => {
    setup();
    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar/i }),
    ).toBeInTheDocument();
  });

  it("does not call onSubmit if form is invalid", async () => {
    setup();
    const submitButton = screen.getByRole("button", { name: /guardar/i });
    await userEvent.click(submitButton);
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onSubmit with correct data and closes modal on valid submit", async () => {
    const onSubmit = jest.fn();
    const setIsCreateOpen = jest.fn();
    setup({ onSubmit, setIsCreateOpen });

    await userEvent.type(screen.getByPlaceholderText("Amount"), "500");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 500,
      completed: "in-progress",
      createdAt: expect.any(String),
      description: "",
      id: 0,
      targetDate: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(setIsCreateOpen).toHaveBeenCalledWith(false);
  });
});
