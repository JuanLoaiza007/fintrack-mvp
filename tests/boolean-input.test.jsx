import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import BooleanInput from "@/components/ui/features/boolean-input";

function Wrapper({ children, defaultValues }) {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("BooleanInput Component", () => {
  it("renders the label and checkbox", () => {
    render(
      <Wrapper defaultValues={{ booleanField: false }}>
        <BooleanInput name="booleanField" label="Accept Terms" />
      </Wrapper>,
    );

    // Verifica que se muestre el label
    expect(screen.getByText("Accept Terms")).toBeInTheDocument();

    // Usa getByLabelText en lugar de getByRole:
    const checkbox = screen.getByLabelText("Accept Terms");
    expect(checkbox).toBeInTheDocument();

    // Comprueba que inicialmente esté desmarcado:
    // Si el componente Checkbox no es un input nativo, es posible que debas chequear su atributo "aria-checked".
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles the checkbox value when clicked", () => {
    render(
      <Wrapper defaultValues={{ booleanField: false }}>
        <BooleanInput name="booleanField" label="Accept Terms" />
      </Wrapper>,
    );

    const checkbox = screen.getByLabelText("Accept Terms");

    // Simula el click para marcar el checkbox
    fireEvent.click(checkbox);

    // Verifica que el atributo "aria-checked" se actualice a "true"
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });
});
