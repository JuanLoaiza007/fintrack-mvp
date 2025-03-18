import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionModule from "@/components/ui/features/transacciones/module";

// Si en tu código no existe setIsHelpOpen, para la prueba puedes hacer un mock
// o modificar el componente temporalmente. Aquí asumimos que se ha resuelto el error
// (por ejemplo, pasando una función dummy en lugar de setIsHelpOpen).

describe("TransactionModule", () => {
  it("renders header and opens create transaction dialog", () => {
    render(<TransactionModule />);

    // Verifica que el encabezado se renderice
    expect(screen.getByText("Gestión de transacciones")).toBeInTheDocument();

    // TransactionFooter renderiza dos botones.
    // Se asume que el segundo botón es el de crear transacción.
    const buttons = screen.getAllByRole("button");
    // Haz clic en el segundo botón (crear transacción)
    fireEvent.click(buttons[1]);

    // Verifica que se abra el diálogo mostrando "Crear Transaccion"
    expect(screen.getByText("Crear Transaccion")).toBeInTheDocument();
  });
});
