jest.mock("remark-gfm", () => {
  return () => {};
});

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import TransactionFooter from "@/components/ui/features/transacciones/footer";
import { TransactionProvider } from "@/context/TransactionContext";

describe("TransactionFooter", () => {
  it("renders AI suggestion component", () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>,
    );
    expect(screen.getByLabelText("AI Suggestion")).toBeInTheDocument();
  });

  it("renders create transaction button", () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>,
    );
    expect(screen.getByLabelText("Create Transaction")).toBeInTheDocument();
  });

  it("calls onOpenCreate when create button is clicked", () => {
    const handleOpenCreate = jest.fn();
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={handleOpenCreate} />
      </TransactionProvider>,
    );
    fireEvent.click(screen.getByLabelText("Create Transaction"));
    expect(handleOpenCreate).toHaveBeenCalledWith(true);
  });

  it("shows the extra button when hovering over the main button", () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>,
    );

    expect(
      screen.queryByLabelText("Extra Plus Action"),
    ).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByLabelText("Create Transaction"));
    expect(screen.getByLabelText("Extra Plus Action")).toBeInTheDocument();
  });

  it("hides the extra button when mouse leaves the button area", async () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>,
    );

    fireEvent.mouseEnter(screen.getByLabelText("Create Transaction"));
    expect(screen.getByLabelText("Extra Plus Action")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByLabelText("Create Transaction"));

    await waitForElementToBeRemoved(() =>
      screen.getByLabelText("Extra Plus Action"),
    );
  });
});
