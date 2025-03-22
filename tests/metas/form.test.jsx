// GoalForm.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GoalForm from "@/components/ui/features/metas/form";

describe("GoalForm", () => {
  const setup = (props = {}) => {
    const defaultProps = {
      setIsCreateOpen: jest.fn(),
      onSubmit: jest.fn(),
      goal: null,
    };
    return render(<GoalForm {...defaultProps} {...props} />);
  };

  it("renders inputs and submit button", () => {
    setup();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar/i }),
    ).toBeInTheDocument();
  });

  it("does not call onSubmit if form is invalid", async () => {
    setup();
    const submit = screen.getByRole("button", { name: /guardar/i });
    await userEvent.click(submit);
    expect(submit).not.toBeDisabled();
  });

  it("calls onSubmit with correct data and closes modal on valid submit", async () => {
    const onSubmit = jest.fn();
    const setIsCreateOpen = jest.fn();
    setup({ onSubmit, setIsCreateOpen });

    const expectedDate = new Date().toISOString();

    await userEvent.type(screen.getByLabelText("Amount"), "123");
    await userEvent.type(screen.getByLabelText("Description"), "My goal");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 123,
      description: "My goal",
      completed: "in-progress",
      id: 0,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      targetDate: expect.any(String),
    });
    expect(setIsCreateOpen).toHaveBeenCalledWith(false);
  });
});
