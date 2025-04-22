import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BudgetHeader from "@/components/ui/features/presupuestos/header";

describe("BudgetHeader", () => {
  let onOpenCreate;
  let onDelete;

  beforeEach(() => {
    onOpenCreate = jest.fn();
    onDelete = jest.fn();
  });

  it("renders budget and expenses correctly", () => {
    render(
      <BudgetHeader
        expenses={[{ amount: 50, date: "2025-03-01T12:00:00Z" }]}
        budget={{ amount: 500 }}
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Tú presupuesto es de:")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("Total gastado este mes:")).toBeInTheDocument();
    expect(
      screen.getByText(
        (content, element) =>
          element.tagName.toLowerCase() === "h3" && content.includes("50"),
      ),
    ).toBeInTheDocument();
  });

  it("disables 'Define tu presupuesto' button when budget exists", () => {
    render(
      <BudgetHeader
        expenses={[]}
        budget={{ amount: 500 }}
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
      />,
    );

    const createButton = screen.getByRole("button", {
      name: /define tu presupuesto/i,
    });
    expect(createButton).toBeDisabled();
  });

  it("calls onOpenCreate when 'Define tu presupuesto' button is clicked and no budget exists", () => {
    render(
      <BudgetHeader
        expenses={[]}
        budget={null}
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
      />,
    );

    const createButton = screen.getByRole("button", {
      name: /define tu presupuesto/i,
    });
    fireEvent.click(createButton);
    expect(onOpenCreate).toHaveBeenCalledWith(true);
  });

  it("calls onOpenCreate when edit button is clicked", () => {
    render(
      <BudgetHeader
        expenses={[]}
        budget={{ amount: 500 }}
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
      />,
    );

    const editButton = screen.getAllByRole("button")[1];
    fireEvent.click(editButton);
    expect(onOpenCreate).toHaveBeenCalledWith(true);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <BudgetHeader
        expenses={[]}
        budget={{ amount: 500 }}
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
      />,
    );

    const deleteButton = screen.getAllByRole("button")[2];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });
});
