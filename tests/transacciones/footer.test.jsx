jest.mock("remark-gfm", () => {
  return () => {};
});

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionFooter from "@/components/ui/features/transacciones/footer";
import { TransactionProvider } from "@/context/TransactionContext";

describe("TransactionFooter", () => {
  it("renders AI suggestion component", () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>
    );
    expect(screen.getByLabelText("AI Suggestion")).toBeInTheDocument();
  });

  it("renders create transaction button", () => {
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={jest.fn()} />
      </TransactionProvider>
    );
    expect(screen.getByLabelText("Create Transaction")).toBeInTheDocument();
  });

  it("calls onOpenCreate when create button is clicked", () => {
    const handleOpenCreate = jest.fn();
    render(
      <TransactionProvider>
        <TransactionFooter onOpenCreate={handleOpenCreate} />
      </TransactionProvider>
    );
    fireEvent.click(screen.getByLabelText("Create Transaction"));
    expect(handleOpenCreate).toHaveBeenCalledWith(true);
  });
});
