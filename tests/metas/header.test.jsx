// GoalHeader.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GoalHeader from "@/components/ui/features/metas/header";

describe("GoalHeader", () => {
  let onOpenCreate;
  let onDelete;
  let onListOpen;

  beforeEach(() => {
    onOpenCreate = jest.fn();
    onDelete = jest.fn();
    onListOpen = jest.fn();
  });

  it("renders four buttons", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("first button is disabled when goal exists", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={true}
      />,
    );

    const createButton = screen.getByRole("button", {
      name: /define tu meta mensual/i,
    });
    expect(createButton).toBeDisabled();
  });

  it("first button calls onOpenCreate(true) when clicked if no goal", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={false}
      />,
    );

    const createButton = screen.getByRole("button", {
      name: /define tu meta mensual/i,
    });
    fireEvent.click(createButton);
    expect(onOpenCreate).toHaveBeenCalledWith(true);
  });

  it("edit icon button calls onOpenCreate(true)", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={false}
      />,
    );

    const [, editButton] = screen.getAllByRole("button");
    fireEvent.click(editButton);
    expect(onOpenCreate).toHaveBeenCalledWith(true);
  });

  it("delete icon button calls onDelete", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={false}
      />,
    );

    const deleteButton = screen.getAllByRole("button")[2];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });

  it("list icon button calls onListOpen(true)", () => {
    render(
      <GoalHeader
        onOpenCreate={onOpenCreate}
        onDelete={onDelete}
        onListOpen={onListOpen}
        goal={false}
      />,
    );

    const listButton = screen.getAllByRole("button")[3];
    fireEvent.click(listButton);
    expect(onListOpen).toHaveBeenCalledWith(true);
  });
});
