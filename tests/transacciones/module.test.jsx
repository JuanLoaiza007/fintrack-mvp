import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionModule from "@/components/ui/features/transacciones/module";
import { TransactionProvider } from "@/context/TransactionContext";

describe("TransactionModule", () => {
  it("renders header and create button", () => {
    render(
      <TransactionProvider>
        <TransactionModule />
      </TransactionProvider>,
    );

    // Verify that the header is rendered
    expect(screen.getByText("Gestión de transacciones")).toBeInTheDocument();

    // Verify that the create button is rendered, assuming the second is the create button
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeInTheDocument();
  });
});
