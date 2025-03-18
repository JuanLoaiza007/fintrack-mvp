import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionFooter from "@/components/ui/features/transacciones/footer";

describe("TransactionFooter Component", () => {
  it("calls onOpenHelp when the help button is clicked", () => {
    const onOpenHelpMock = jest.fn();
    const onOpenCreateMock = jest.fn();

    render(
      <TransactionFooter
        onOpenHelp={onOpenHelpMock}
        onOpenCreate={onOpenCreateMock}
      />,
    );

    // Obtenemos todos los botones. Se asume que el botón de ayuda es el primero.
    const buttons = screen.getAllByRole("button");

    // Simulamos el click en el primer botón.
    fireEvent.click(buttons[0]);

    // Se espera que onOpenHelp se llame con "true".
    expect(onOpenHelpMock).toHaveBeenCalledWith(true);
  });

  it("calls onOpenCreate when the create button is clicked", () => {
    const onOpenHelpMock = jest.fn();
    const onOpenCreateMock = jest.fn();

    render(
      <TransactionFooter
        onOpenHelp={onOpenHelpMock}
        onOpenCreate={onOpenCreateMock}
      />,
    );

    // Obtenemos todos los botones. Se asume que el botón de crear es el segundo.
    const buttons = screen.getAllByRole("button");

    // Simulamos el click en el segundo botón.
    fireEvent.click(buttons[1]);

    // Se espera que onOpenCreate se llame con "true".
    expect(onOpenCreateMock).toHaveBeenCalledWith(true);
  });
});
